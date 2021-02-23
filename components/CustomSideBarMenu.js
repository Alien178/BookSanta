import * as React from "react";
import { StyleSheet, View, TouchableOpacity, Text, ImageBackground } from "react-native";
import { Avatar } from "react-native-elements";
import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions"
import { DrawerItems } from "react-navigation-drawer";
import db from "../config";
import firebase from "firebase";

export default class CustomSideBarMenu extends React.Component {
  constructor() {
    super();
    this.state = {
      userID: firebase.auth().currentUser.email,
      image: "#",
      name: "",
      docID: "",
    }
  }

  selectPicture = async() => {
    const {cancelled, uri} = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    })

    if (!cancelled) {
      this.uploadImage(uri, this.state.userID)
    }
  }

  uploadImage = async(uri, imageName) => {
    var response = await fetch(uri)
    var blob = await response.blob()
    var ref = firebase.storage().ref().child("userProfiles/" + imageName)
    return ref.put(blob).then((response) => {
      this.fetchImage(imageName)
    })
  }

  fetchImage = (imageName) => {
    var ref = firebase.storage().ref().child("userProfiles/" + imageName);
    ref.getDownloadURL().then((url) => {
      this.setState({
        image: url,

      })
    }).catch((error) => {
      this.setState({
        image: "#"
      })
    })
  }

  getUserProfile() {
    db.collection("users").where("emailID", "==", this.state.userID).onSnapshot((snapshot) => {
      snapshot.forEach((doc) => {
        this.setState({
          name: doc.data().firstName + " " + doc.data().lastName,
          docID: doc.id,
          image: doc.data().image
        })
      })
    })
  }

  componentDidMount() {
    this.fetchImage(this.state.userID);
    this.getUserProfile();
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 0.5, alignItems: "center", backgroundColor: "orange" }}>
          <Avatar rounded source = {{uri: this.state.image}} size = {"medium"} onPress = {() => {
            this.selectPicture()
          }} containerStyle = {{flex: 0.75, width: "40%", height: "20%", marginLeft: 0, marginTop: 40, borderRadius: 40}} />
          <Text style = {{fontWeight: "bold", fontSize: 20, paddingTop: 10}}>{this.state.name}</Text>
        </View>
        <View style={{ flex: 0.6, marginTop: 10, }}>
          <DrawerItems {...this.props}></DrawerItems>
        </View>
        <View
          style={{ flex: 0.4, justifyContent: "flex-end", paddingBottom: 50, alignItems: "center", }}
        >
          <TouchableOpacity
            style={{
              height: 40,
              width: "50%",
              justifyContent: "center",
              padding: 10,
              backgroundColor: "#8C0303",
              borderColor: "#400101",
              borderWidth: 4,
              borderRadius: 5,
            }}

            onPress={() => {
              this.props.navigation.navigate("WelcomeScreen");
              firebase.auth().signOut();
            }}
          >
            <Text
              style={{ textAlign: "center", fontSize: 20, fontWeight: "bold" }}
            >
              Log Out
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
