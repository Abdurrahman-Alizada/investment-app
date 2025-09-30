import { Dimensions } from "react-native";

const Colours = {
    primaryColour: '#6a39f4',
    backgroundColour: '#efefef',
    subButton:'#a585ff'
};

const { width, height } = Dimensions.get('window');

// Use named exports
export { Colours, width, height };
