import React, { useState, useRef, useEffect } from "react";
import {
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  useColorScheme
} from "react-native";
import {Colours} from "../../constants/Details";
import AppIntroSlider from "react-native-app-intro-slider";
import Icon from 'react-native-vector-icons/AntDesign';
import Svg, { Circle } from "react-native-svg";
import CustomText from "../components/CustomText";
// import CustomButton from "../components/CustomButton";
import LottieView from "lottie-react-native";
import { Colors } from "../../constants/Colors";

const slides = [
  {
    id: 1,
    title: "Invest in Real Estate with Ease",
    description: "Own a piece of prime property without the hassle. Start with as little as $100.",
    image: require("../../assets/animation/realEstate.json"),
  },
  {
    id: 2,
    title: "Buy Gold at Real Prices",
    description: "Secure your wealth with real gold. No hidden fees, no markups.",
    image: require("../../assets/animation/stocks.json"),
  },
  {
    id: 3,
    title: "Invest in Solar Energy, Risk-Free",
    description: "Support green energy and earn returns with zero risk.",
    image: require("../../assets/animation/power.json"),
  },
  {
    id: 4,
    title: "Trade Real Stocks for Free",
    description: "Buy and sell stocks on the Colombo Stock Exchange (CSE) with zero commission.",
    image: require("../../assets/animation/stocks.json"),
  },
];

const { width, height } = Dimensions.get("window");

const Onboarding = ({ navigation }) => {

const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? "dark" : "light";
  const styles = createStyles(theme);

  const [showHomeScreen, setShowHomeScreen] = useState(false);
  const sliderRef = useRef(null); // Ref for the AppIntroSlider
  const [activeIndex, setActiveIndex] = useState(0); // Track active slide index


  useEffect(() => {
    if (showHomeScreen) {
      // Add a small delay to ensure the slider is unmounted before navigating
      setTimeout(() => {
        navigation.replace("CountrySelection");
      }, 100); // 100ms delay
    }
  }, [showHomeScreen]);
  // Border progress values (in percentage)
  const borderProgress = [25, 50, 75, 100];

  // Function to handle next button press
  const handleNext = () => {
    if (activeIndex < slides.length - 1) {
      const nextIndex = activeIndex + 1;
      console.log("Going to slide:", nextIndex);
      sliderRef.current.goToSlide(nextIndex, true); // Ensure smooth transition
      setActiveIndex(nextIndex);
    } else {
      setShowHomeScreen(true);
      // navigation.replace("CountrySelection");
    }
  };
  

  // Render function for the pagination
  const renderPagination = (activeIndex) => {
    const strokeWidth = 2;
    const radius = 30 - strokeWidth / 2; // Adjusted for stroke width
    const circumference = 2 * Math.PI * radius;
    const progress = (borderProgress[activeIndex] / 100) * circumference;
  
    return (
      <View style={[styles.paginationContainer,activeIndex===slides.length-1&&styles.paginationContainer2]}>
        <View style={styles.innerContainer}>
          <View style={styles.dotsContainer}>
            {slides.map((_, i) => (
              <View key={i} style={[styles.dot, i === activeIndex && styles.activeDot]} />
            ))}
          </View>
  
          <View style={styles.progressCircle}>
            {/* Only show progress circle if it's NOT the last slide */}
            {activeIndex !== slides.length - 1 && (
              <Svg height="60" width="60" viewBox="0 0 60 60">
                <Circle
                  cx="30"
                  cy="30"
                  r={radius}
                  stroke={Colours.primaryColour}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeDasharray={`${progress}, ${circumference}`}
                  strokeLinecap="round"
                  transform="rotate(-90, 30, 30)" // Rotate to start from top-right
                />
              </Svg>
            )}
  
            {/* Button changes on the last slide */}
            <TouchableOpacity
              style={[styles.nextButton, activeIndex === slides.length - 1 && styles.getStartedButton]}
              onPress={handleNext}
            >
              {activeIndex === slides.length - 1 ? (
                <Text style={styles.getStartedText}>Get Started</Text>
              ) : (
                <Icon name="arrowright" size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };
  
  

  if (!showHomeScreen) {
    return (
      <View style={{ flex: 1,backgroundColor:'white' }}>
        <AppIntroSlider
          ref={sliderRef} // Assign the ref
          data={slides}
          renderItem={({ item }) => (
            <View style={styles.slide}>
               <LottieView source={item.image} autoPlay loop style={styles.image} />
          <CustomText style={styles.title}>{item.title}</CustomText>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          )}
          activeDotStyle={{
            backgroundColor: Colours.primaryColour,
            width: 30,
          }}
          onSlideChange={(index) => {
            console.log("Slide changed to:", index);
            setActiveIndex(index);
          }} // Update active index
          renderPagination={renderPagination}
        />
      </View>
    );
  }

 return null
};

const createStyles = (theme)=>StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors[theme].background,
  },
  slide: {
    flex: 1,
    padding: 15,
    backgroundColor: Colors[theme].background,
    justifyContent: "center",
  },
  image: {
    width: '90%',
    height: height * 0.5,
    alignSelf: "center",
  },
  title: {
    fontWeight: "900",
    fontSize: 36,
    marginTop: 20,
  },
  description: {
    fontSize: 18,
    marginTop: 10,
    color: Colors[theme].gray,
  },
  paginationContainer: {
  position: "absolute",
  bottom: 40,
  alignSelf: "center", // Centers the container properly
  width: "90%", // Adjust width so content stays inside
  // backgroundColor: "blue",
},
  paginationContainer2: {
  position: "absolute",
  bottom: 40,
  alignSelf: "center", // Centers the container properly
  width: "90%", // Adjust width so content stays inside
  // backgroundColor: "blue",
  paddingRight:50
},

  innerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%", // Ensures the elements stay inside
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors[theme].gray,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: Colors[theme].primaryColour,
  },
  progressCircle: {
    flexDirection: "row",
    alignItems: "center",
  },
  nextButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors[theme].primaryColour,
    alignItems: "center",
    justifyContent: "center",
  },
  getStartedButton: {
    width: 150, // Make the button wider
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors[theme].primaryColour,// No border, solid fill
    justifyContent: "center",
    alignItems: "center",
  },
  getStartedText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  // activeDot: {
  //   width: 30,
  //   backgroundColor: Colours.primaryColour,
  // },
  progressCircle: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  nextButton: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors[theme].primaryColour,
    justifyContent: "center",
    alignItems: "center",
  },
  getStartedText: {
    color: Colors[theme].background,
    fontSize: 14,
    fontWeight: "bold",
  },
 
});

export default Onboarding;