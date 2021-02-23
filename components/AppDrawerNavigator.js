import * as React from "react";
import { createDrawerNavigator } from "react-navigation-drawer";
import { AppTabNavigator } from "./AppTabNavigator";
import CustomSideBarMenu from "./CustomSideBarMenu";
import SettingScreen from "../screens/SettingScreen"
import MyDonationScreen from "../screens/MyDonationScreen";
import NotificationScreen from "../screens/NotificationScreen";
import MyReceivedBookScreen from '../screens/MyReceivedBookScreen';

export const AppDrawerNavigator = createDrawerNavigator({
    Home: {screen: AppTabNavigator},
    Settings: {screen: SettingScreen},
    MyDonations: {screen: MyDonationScreen},
    Notifications: {screen: NotificationScreen},
    ReceivedBooks: {screen: MyReceivedBookScreen}
}, {contentComponent: CustomSideBarMenu}, {intialRouteName: "Home"})