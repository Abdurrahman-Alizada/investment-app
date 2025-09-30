import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Modal,
  FlatList,
  Image,
  ActivityIndicator,
  Pressable,
  Button,
  Platform,
  useColorScheme,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Colours} from '../../constants/Details';
import Header from '../components/Header';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {auth} from '../utils/firebase';
import toast from '../../helpers/toast';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {Colors} from '../../constants/Colors';
import LoaderAnim from '../components/Loader';

const questions = [
  {
    id: 1,
    text: 'Are you a citizen of only (selected country) ?',
    type: 'radio',
    options: ['Only a citizen', 'Dual citizenship'],
  },
  {
    id: 2,
    text: 'Enter your second citizenship country (if applicable)',
    type: 'dropdown',
  },
  {id: 3, text: 'Select your date of birth', type: 'date'},
  {
    id: 4,
    text: 'In which financial products have you already invested on a regular basis?',
    type: 'multiple',
    options: ['Stocks', 'Bonds', 'Real Estate'],
  },
  {
    id: 5,
    text: 'How long have you been investing in financial products?',
    type: 'radio',
    options: [
      'Less than 1 year',
      '1 to 2 years',
      '3 to 5 years',
      'More than 5 years',
    ],
  },
  {
    id: 6,
    text: 'How familiar are you with investing?',
    type: 'radio',
    options: [
      ' Very familiar',
      'Familiar',
      'Somewhat familiar',
      'Not familiar',
      ' New to investing',
    ],
  },
  {
    id: 7,
    text: 'Describe your attitude towards investing.',
    type: 'radio',
    options: [
      '  I am not comfortable with losses.',
      '  I do not mind taking small risks.',
      'I am aiming for long-term growth; some risk is okay.',
      ' Short-term losses are okay if it means better long-term growth.',
    ],
  },
  {
    id: 8,
    text: 'What would you do if you lost 10% of your investment in a year?',
    type: 'radio',
    options: [
      'Sell everything',
      'Sell part of my holdings',
      'Switch to a conservative portfolio',
      'Do nothing',
      'Invest more',
    ],
  },
  {
    id: 9,
    text: 'How stable are your current and future income sources?',
    type: 'radio',
    options: [
      'Very unstable',
      'Unstable',
      'Somewhat stable',
      'Stable',
      'Very stable',
    ],
  },
  {
    id: 10,
    text: 'What is your liquid net worth?',
    type: 'radio',
    options: [
      'USD 0 - USD 100,000',
      'USD 100,000 - USD 500,000',
      'USD 500,000 - USD 1,000,000',
      'USD 1,000,000 - USD 5,000,000',
      'USD 5,000,000 - USD 10,000,000',
      'USD 10,000,000+',
    ],
  },
  {
    id: 11,
    text: 'What is your pre-tax annual income?',
    type: 'radio',
    options: [
      'USD 0 - USD 25,000',
      'USD 25,001 - USD 50,000',
      'USD 50,001 - USD 100,000',
      'USD 100,001 - USD 200,000',
      'USD 200,001 - USD 300,000',
      'USD 300,001 - USD 500,000',
      'USD 500,001 - USD 1,200,000',
      'USD 1,200,001 - USD 9,999,999',
    ],
  },
];

const QuizScreen = ({navigation}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const styles = createStyles(theme);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [tempDate, setTempDate] = useState(new Date());
  // const currentQuestion = questions[currentQuestionIndex];
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    console.log('answers', answers);

    console.log('uid', uid);
    fetchCountries();
  }, [answers]);

  const shouldShowQuestion = question => {
    if (question.id === 2) {
      return answers[1] === 'Dual citizenship';
    }
    return true;
  };

  const filteredQuestions = questions.filter(shouldShowQuestion);
  const currentQuestion = filteredQuestions[currentQuestionIndex] || {};

  const renderProgressBar = () => {
    const totalQuestions = filteredQuestions.length || 1;
    const progress = Math.min(
      ((currentQuestionIndex + 1) / totalQuestions) * 100,
      100,
    );
    return (
      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBar,
            {width: `${progress}%`, backgroundColor: Colours.primaryColour},
          ]}
        />
      </View>
    );
  };

  const fetchCountries = async () => {
    try {
      const response = await fetch(
        'https://restcountries.com/v2/all?fields=name,alpha2Code,callingCodes',
      );
      const data = await response.json();

      const formattedCountries = data
        .map(country => ({
          code: country.alpha2Code,
          name: country.name,
          callingCode: country.callingCodes?.[0]
            ? `+${country.callingCodes[0]}`
            : '',
          flag: `https://flagcdn.com/w80/${country.alpha2Code.toLowerCase()}.png`,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      setCountries(formattedCountries);
      // setFilteredCountries(formattedCountries);
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load countries. Please try again later.');
      setLoading(false);
    }
  };

  const updateAnswer = (questionId, value) => {
    const newAnswers = {...answers, [questionId]: value};
    setAnswers(newAnswers);

    // Skip question 2 if "Only a citizen" is selected in question 1
    if (questionId === 1 && value === 'Only a citizen') {
      setSelectedCountry(null);
      setModalVisible(false);

      // Find the index of the next question to show (skipping question 2)
      const nextQuestionIndex = filteredQuestions.findIndex(
        q => q.id === 3, // Look for date of birth question
      );

      if (nextQuestionIndex !== -1) {
        setCurrentQuestionIndex(nextQuestionIndex);
      }
    }
  };

  const handleMultiSelect = (questionId, option) => {
    setAnswers(prev => {
      const selectedAnswers = prev[questionId] || []; // Ensure it's an array
      const updatedAnswers = selectedAnswers.includes(option)
        ? selectedAnswers.filter(answer => answer !== option) // Remove if already selected
        : [...selectedAnswers, option]; // Add if not selected

      return {...prev, [questionId]: updatedAnswers};
    });
  };

  const renderQuestion = question => {
    if (question.type === 'radio') {
      return question.options.map((option, index) => (
        <TouchableOpacity
          key={option}
          style={{
            padding: 16,
            backgroundColor: 'white',
            borderBottomWidth: 1,
            borderColor: 'gray',
            marginTop: index === 0 ? 10 : 0,
            borderTopLeftRadius: index === 0 ? 5 : 0,
            borderTopRightRadius: index === 0 ? 5 : 0,
            borderBottomLeftRadius:
              index === question.options.length - 1 ? 5 : 0,
            borderBottomRightRadius:
              index === question.options.length - 1 ? 5 : 0,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          onPress={() => updateAnswer(question.id, option)}>
          <Text style={{color: 'black', fontSize: 16}}>{option}</Text>
          <View
            style={{
              padding: 3,
              borderWidth: 1,
              borderRadius: 100,
              borderColor:
                answers[question.id] === option
                  ? Colours.primaryColour
                  : 'black',
            }}>
            <View
              style={{
                padding: 10,
                backgroundColor:
                  answers[question.id] === option
                    ? Colours.primaryColour
                    : 'white',
                borderRadius: 100,
              }}></View>
          </View>
        </TouchableOpacity>
      ));
    }

    if (question.type === 'multiple') {
      return question.options.map((option, index) => {
        const selectedOptions = answers[question.id] || []; // Ensure it's an array
        const isSelected = selectedOptions.includes(option); // Check if option is selected

        return (
          <TouchableOpacity
            key={option}
            style={{
              padding: 16,
              backgroundColor: 'white',
              borderBottomWidth: index === question.options.length - 1 ? 0 : 1,
              borderColor: 'gray',
              marginTop: index === 0 ? 10 : 0, // Apply marginTop only to the first option
              borderTopLeftRadius: index === 0 ? 5 : 0,
              borderTopRightRadius: index === 0 ? 5 : 0,
              borderBottomLeftRadius:
                index === question.options.length - 1 ? 5 : 0,
              borderBottomRightRadius:
                index === question.options.length - 1 ? 5 : 0,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
            onPress={() => handleMultiSelect(question.id, option)}>
            <Text style={{color: 'black', fontSize: 16}}>{option}</Text>
            <View
              style={{
                padding: 3,
                borderWidth: 1,
                borderRadius: 100,
                borderColor: isSelected ? Colours.primaryColour : 'black',
              }}>
              <View
                style={{
                  padding: 10,
                  backgroundColor: isSelected ? Colours.primaryColour : 'white',
                  borderRadius: 100,
                }}></View>
            </View>
          </TouchableOpacity>
        );
      });
    }

    if (question.type === 'date') {
      return (
        <View>
          <TouchableOpacity
            onPress={() => {
              setTempDate(
                answers[question.id]
                  ? new Date(answers[question.id])
                  : new Date(),
              );
              setShowDatePicker(true);
            }}
            style={{
              padding: 16,
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 5,
              marginBottom: 10,
            }}>
            <Text style={{color: 'gray'}}>
              {answers[question.id] || 'Select your birthdate'}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (question.type === 'dropdown') {
      return loading ? (
        <ActivityIndicator size="large" color="black" />
      ) : (
        <View>
          {/* Selected Country Display */}
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setModalVisible(true)}>
            {selectedCountry ? (
              <>
                <Image
                  source={{uri: selectedCountry.flag}}
                  style={styles.flagIcon}
                />
                <Text style={styles.dropdownText}>{selectedCountry.name}</Text>
              </>
            ) : (
              <Text style={styles.dropdownText}>Select a country...</Text>
            )}
          </TouchableOpacity>

          {/* Country Selection Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select a Country</Text>
                <FlatList
                  data={countries}
                  keyExtractor={item => item.name}
                  renderItem={({item}) => (
                    <TouchableOpacity
                      style={styles.option}
                      onPress={() => {
                        setSelectedCountry(item);
                        updateAnswer(question.id, item.name);
                        setModalVisible(false);
                      }}>
                      <Image
                        source={{uri: item.flag}}
                        style={styles.flagIcon}
                      />
                      <Text style={styles.optionText}>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                />
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      );
    }

    return null;
  };

  const handleNext = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      // Find the index of the previous question in the filtered list
      const prevQuestionId = filteredQuestions[currentQuestionIndex - 1].id;
      setCurrentQuestionIndex(currentQuestionIndex - 1);

      // If going back to question 1, reset question 2 answer if needed
      if (prevQuestionId === 1 && answers[1] === 'Only a citizen') {
        const newAnswers = {...answers};
        delete newAnswers[2]; // Remove answer for question 2
        setAnswers(newAnswers);
      }
    }
  };

  const handleSubmit = async () => {
    // First check if all required questions (from filtered list) are answered
    const requiredQuestions = filteredQuestions.map(q => q.id);
    const answeredQuestions = Object.keys(answers).map(Number);

    const missingQuestions = requiredQuestions.filter(
      id => !answeredQuestions.includes(id),
    );

    if (missingQuestions.length > 0) {
      toast.info({message: 'Please answer all questions before submitting!'});
      return;
    }

    try {
      setLoading(true);

      const db = getFirestore(); // Initialize Firestore

      // Transform answers object to replace question IDs with actual question text
      const formattedAnswers = Object.keys(answers)
        .map(questionId => {
          const numericId = Number(questionId);
          const questionObj = questions.find(q => q.id === numericId);

          // Skip questions that weren't shown to the user
          if (!filteredQuestions.some(q => q.id === numericId)) {
            return null;
          }

          return {
            question: questionObj
              ? questionObj.text
              : `Unknown Question (${numericId})`,
            answer: answers[questionId],
          };
        })
        .filter(Boolean); // Remove null entries

      // Save only relevant questions/answers
      const userQuestionsRef = collection(db, 'users', uid, 'questions');
      await addDoc(userQuestionsRef, {
        formattedAnswers,
        timestamp: serverTimestamp(),
      });

      // Update user document with answeredQuestions and dummyMoney
      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, {
        answeredQuestions: true,
        dummyMoney: 100000,
      });

      // Update or create the 'cash' document in the totalAssets collection
      const cashDocRef = doc(
        collection(db, 'users', uid, 'totalAssets'),
        'cash',
      );
      await setDoc(
        cashDocRef,
        {
          amount: 100000,
        },
        {merge: true}, // Merge ensures existing fields are not overwritten
      );

      toast.info({message: 'Quiz submitted successfully!'});
      navigation.replace('DummyMoney');
      setAnswers({});
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.info({message: 'Failed to submit quiz!'});
    } finally {
      setLoading(false);
    }
  };

  const renderRadioOption = (option, question, index) => (
    <Animated.View entering={FadeInDown.delay(index * 100)} key={option}>
      <Pressable
        style={[
          styles.optionCard,
          answers[question.id] === option && styles.selectedOptionCard,
        ]}
        onPress={() => updateAnswer(question.id, option)}>
        <View style={styles.optionContent}>
          <Text
            style={[
              styles.optionText,
              answers[question.id] === option && styles.selectedOptionText,
            ]}>
            {option}
          </Text>
          <View
            style={[
              styles.radioOuter,
              answers[question.id] === option && styles.selectedRadioOuter,
            ]}>
            <View
              style={[
                styles.radioInner,
                answers[question.id] === option && styles.selectedRadioInner,
              ]}
            />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );

  const renderMultipleOption = (option, question, index) => {
    const selectedOptions = answers[question.id] || [];
    const isSelected = selectedOptions.includes(option);

    return (
      <Animated.View entering={FadeInDown.delay(index * 100)} key={option}>
        <TouchableOpacity
          style={[styles.optionCard, isSelected && styles.selectedOptionCard]}
          onPress={() => handleMultiSelect(question.id, option)}>
          <View style={styles.optionContent}>
            <Text
              style={[
                styles.optionText,
                isSelected && styles.selectedOptionText,
              ]}>
              {option}
            </Text>
            <View
              style={[
                styles.checkboxOuter,
                isSelected && styles.selectedCheckboxOuter,
              ]}>
              {isSelected && <Icon name="check" size={16} color="white" />}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const onChange = (event, selectedDate) => {
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header navigation={navigation} hiddenBack={true} />
      <View style={styles.content}>
        {renderProgressBar()}

        <View style={styles.questionHeader}>
          <Text style={styles.questionNumber}>
            Question {currentQuestionIndex + 1} of {filteredQuestions.length}
          </Text>
          <Text style={styles.questionText}>
            {filteredQuestions[currentQuestionIndex].text}
          </Text>
        </View>

        <ScrollView style={styles.optionsContainer}>
          {currentQuestion.type === 'radio' &&
            currentQuestion.options.map((option, index) =>
              renderRadioOption(option, currentQuestion, index),
            )}

          {currentQuestion.type === 'multiple' &&
            currentQuestion.options.map((option, index) =>
              renderMultipleOption(option, currentQuestion, index),
            )}

          {currentQuestion.type === 'date' && (
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.dateButton}>
              <Icon name="calendar" size={24} color={Colours.primaryColour} />
              <Text style={styles.dateButtonText}>
                {answers[currentQuestion.id] || 'Select your birthdate'}
              </Text>
            </TouchableOpacity>
          )}

          {showDatePicker && (
            <DateTimePicker
              mode="date"
              value={new Date()}
              display="spinner"
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) updateAnswer(currentQuestion.id, date.toDateString());
              }}
            />
          )}

          {currentQuestion.type === 'dropdown' && (
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setModalVisible(true)}>
              <Icon name="earth" size={24} color={Colours.primaryColour} />
              <Text style={styles.dropdownButtonText}>
                {selectedCountry ? selectedCountry.name : 'Select a country'}
              </Text>
              <Icon
                name="chevron-down"
                size={24}
                color={Colours.primaryColour}
              />
            </TouchableOpacity>
          )}
        </ScrollView>

        <View style={styles.navigationButtons}>
          {currentQuestionIndex > 0 && (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Icon name="arrow-left" size={24} color={Colours.primaryColour} />
              <Text style={styles.backButtonText}>Previous</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={
              currentQuestionIndex < filteredQuestions.length - 1
                ? handleNext
                : handleSubmit
            }
            style={styles.nextButton}>
            <View style={styles.nextButtonGradient}>
              <Text style={styles.nextButtonText}>
                {currentQuestionIndex < filteredQuestions.length - 1
                  ? 'Next'
                  : 'Submit'}
              </Text>
              <Icon
                name={
                  currentQuestionIndex < filteredQuestions.length - 1
                    ? 'arrow-right'
                    : 'check'
                }
                size={24}
                color="white"
              />
            </View>
          </TouchableOpacity>
        </View>

        <Modal animationType="slide" transparent={true} visible={modalVisible}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select a Country</Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.modalCloseButton}>
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <FlatList
                data={countries}
                keyExtractor={item => item.name}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={styles.countryOption}
                    onPress={() => {
                      setSelectedCountry(item);
                      updateAnswer(currentQuestion.id, item.name);
                      setModalVisible(false);
                    }}>
                    <Image source={{uri: item.flag}} style={styles.flagIcon} />
                    <Text style={styles.countryName}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        {/* <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
      >
        <View style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0,0,0,0.3)',
        }}>
          <View style={{
            backgroundColor: 'white',
            padding: 16,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}>
            <DateTimePicker
              mode="date"
              // display="spinner"
              value={tempDate}
              onChange={onChange}
              style={{ backgroundColor: 'white' }}
            />
{Platform.OS==='ios' && (
     <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
              <Button
                title="Cancel"
                onPress={() => setShowDatePicker(false)}
              />
              <View style={{ width: 10 }} />
              <Button
                title="OK"
                onPress={() => {
                  updateAnswer(currentQuestion.id, tempDate.toDateString());
                  setShowDatePicker(false);
                }}
              />
            </View>
)}
         
          </View>
        </View>
      </Modal> */}
      </View>
      {loading && <LoaderAnim />}
    </SafeAreaView>
  );
};

const createStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[theme].background,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    progressContainer: {
      height: 6,
      backgroundColor: 'white',
      borderRadius: 3,
      marginBottom: 24,
    },
    progressBar: {
      height: '100%',
      borderRadius: 3,
      colour: 'blue',
    },
    questionHeader: {
      marginBottom: 24,
    },
    questionNumber: {
      fontSize: 14,
      color: Colours.primaryColour,
      fontWeight: '600',
      marginBottom: 8,
    },
    questionText: {
      fontSize: 20,
      fontWeight: '700',
      color: Colors[theme].textColor,
      lineHeight: 28,
    },
    optionsContainer: {
      flex: 1,
    },
    optionCard: {
      backgroundColor: Colors[theme].background,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: '#e1e1e1',
      padding: 16,
    },
    selectedOptionCard: {
      borderColor: Colours.primaryColour,
      backgroundColor: Colors[theme].background,
    },
    optionContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    optionText: {
      flex: 1,
      fontSize: 16,
      color: Colors[theme].textColor,
    },
    selectedOptionText: {
      color: Colours.primaryColour,
      fontWeight: '600',
    },
    radioOuter: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: '#666',
      justifyContent: 'center',
      alignItems: 'center',
    },
    selectedRadioOuter: {
      borderColor: Colours.primaryColour,
    },
    radioInner: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: 'transparent',
    },
    selectedRadioInner: {
      backgroundColor: Colours.primaryColour,
    },
    checkboxOuter: {
      width: 24,
      height: 24,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: '#666',
      justifyContent: 'center',
      alignItems: 'center',
    },
    selectedCheckboxOuter: {
      borderColor: Colours.primaryColour,
      backgroundColor: Colours.primaryColour,
    },
    dateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors[theme].background,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: '#e1e1e1',
    },
    dateButtonText: {
      marginLeft: 12,
      fontSize: 16,
      color: '#666',
    },
    dropdownButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors[theme].background,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: '#e1e1e1',
    },
    dropdownButtonText: {
      flex: 1,
      marginLeft: 12,
      fontSize: 16,
      color: Colors[theme].textColor,
    },
    navigationButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 24,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
    },
    backButtonText: {
      marginLeft: 8,
      fontSize: 16,
      color: Colours.primaryColour,
      fontWeight: '600',
    },
    nextButton: {
      flex: 1,
      marginLeft: 16,
    },
    nextButtonGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      borderRadius: 12,
      backgroundColor: Colours.primaryColour,
    },
    nextButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
      marginRight: 8,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: '#fff',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#1a1a1a',
    },
    modalCloseButton: {
      padding: 4,
    },
    countryOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    flagIcon: {
      width: 24,
      height: 16,
      marginRight: 12,
      borderRadius: 2,
    },
    countryName: {
      fontSize: 16,
      color: '#1a1a1a',
    },
  });

export default QuizScreen;
