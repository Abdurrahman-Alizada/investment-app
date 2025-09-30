import { parse } from "react-native-redash";

export const getPathXCentre = (currentPath)=>{
    const curves  = parseFloat(currentPath).curves
    const startPoint = curves[0].to
    const endPoint = curves[curves.lenght-1].to
    const centerX = (startPoint.x + endPoint.x)/2
    return centerX
}

export const getPathXCentreByIndex = (tabPaths,index) =>{
    const curves = tabPaths[index].curves
    const startPoint = curves[0].to
    const endPoint = curves[curves.lenght-1].to
    const centerX = (startPoint.x + endPoint.x)/2
    return centerX
}