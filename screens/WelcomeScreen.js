import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  KeyboardAvoidingView,
  ToastAndroid,
  Alert,
  FlatList,
  Modal,
  ScrollView,
} from "react-native";
import db from "../config";
import firebase from "firebase";

export default class WelcomeScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      emailID: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      contact: "",
      address: "",
      isModalVisible: false,
    };
  }

  userLogin = async (emailID, password) => {
    firebase
      .auth()
      .signInWithEmailAndPassword(emailID, password)
      .then(() => {
        this.props.navigation.navigate("DonateBook")
      })
      .catch((error) => {
        var errorCode = error.error;
        var errorMessage = error.message;
        console.log(errorMessage);
      });
  };

  userSignUp = async (emailID, password, confirmPassword) => {
    if (password != confirmPassword) {
      return Alert.alert("Passwords do not match!");
    } else {
      firebase
        .auth()
        .createUserWithEmailAndPassword(emailID, password)
        .then(() => {
          db.collection("users").add({
            firstName: this.state.firstName,
            lastName: this.state.lastName,
            address: this.state.address,
            contact: this.state.contact,
            emailID: this.state.emailID,
            isBookRequestActive: false,
          });
          return Alert.alert("User Sign Up Successful!!", "", [
            {
              text: "Ok",
              onPress: () => {
                this.setState({ isModalVisible: false });
              },
            },
          ]);
        })
        .catch((error) => {
          var errorCode = error.error;
          var errorMessage = error.message;
          console.log(errorMessage);
        });
    }
  };

  showModal = () => {
    return (
      <Modal
        animationType={"slide"}
        transparent={true}
        visible={this.state.isModalVisible}
      >
        <View style={styles.modalContainer}>
          <ScrollView style={{ width: "100%" }}>
            <KeyboardAvoidingView style={styles.KeyboardAvoidingView}>
              <Text style={styles.modalTitle}>Sign Up</Text>
              <TextInput
                style={styles.formTextInput}
                placeholder="First Name"
                maxLength={8}
                onChangeText={(text) => {
                  this.setState({
                    firstName: text,
                  });
                }}
              ></TextInput>
              <TextInput
                style={styles.formTextInput}
                placeholder="Last Name"
                maxLength={8}
                onChangeText={(text) => {
                  this.setState({
                    lastName: text,
                  });
                }}
              ></TextInput>
              <TextInput
                style={styles.formTextInput}
                placeholder="Contact"
                maxLength={10}
                keyboardType={"numeric"}
                onChangeText={(text) => {
                  this.setState({
                    contact: text,
                  });
                }}
              ></TextInput>
              <TextInput
                style={styles.formTextInput}
                placeholder="Address"
                multiline={true}
                onChangeText={(text) => {
                  this.setState({
                    address: text,
                  });
                }}
              ></TextInput>
              <TextInput
                placeholder={"Email ID"}
                style={styles.formTextInput}
                keyboardType={"email-address"}
                onChangeText={(text) => {
                  this.setState({
                    emailID: text,
                  });
                }}
              ></TextInput>
              <TextInput
                placeholder={"Password"}
                style={styles.formTextInput}
                secureTextEntry={true}
                onChangeText={(text) => {
                  this.setState({
                    password: text,
                  });
                }}
              ></TextInput>
              <TextInput
                placeholder={"Confirm Password"}
                style={styles.formTextInput}
                secureTextEntry={true}
                onChangeText={(text) => {
                  this.setState({
                    confirmPassword: text,
                  });
                }}
              ></TextInput>
              <View>
                <TouchableOpacity
                  style={styles.registerButton}
                  onPress={() => {
                    this.userSignUp(
                      this.state.emailID,
                      this.state.password,
                      this.state.confirmPassword
                    );
                  }}
                >
                  <Text style={styles.registerButtonText}>Sign Up</Text>
                </TouchableOpacity>
              </View>
              <View>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    this.setState({ isModalVisible: false });
                  }}
                >
                  <Text style={styles.registerButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  render() {
    return (
      <View style={styles.container}>
        {this.showModal()}
        <View style={styles.profileContainer}>
          <Image
            source={require("../assets/bookSanta.png")}
            style={{ width: 200, height: 200 }}
          />
          <Text style={styles.title}>Book Santa</Text>
        </View>
        <View>
          <TextInput
            placeholder={"Email ID"}
            placeholderTextColor={"#ffffff"}
            style={styles.loginBox}
            keyboardType={"email-address"}
            onChangeText={(text) => {
              this.setState({
                emailID: text,
              });
            }}
          ></TextInput>
          <TextInput
            placeholder={"Password"}
            placeholderTextColor={"#ffffff"}
            style={styles.loginBox}
            secureTextEntry={true}
            onChangeText={(text) => {
              this.setState({
                password: text,
              });
            }}
          ></TextInput>
          <TouchableOpacity
            style={[styles.button, { marginTop: 20, marginBottom: 20 }]}
            onPress={() => {
              this.userLogin(this.state.emailID, this.state.password);
            }}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              this.setState({ isModalVisible: true });
            }}
          >
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8BE85",
    alignItems: "center",
    justifyContent: "center",
  },
  profileContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 65,
    fontWeight: "300",
    paddingBottom: 10,
    color: "#ff3d00",
  },
  loginBox: {
    width: 300,
    height: 40,
    borderBottomWidth: 1.5,
    borderColor: "#ff8a65",
    fontSize: 20,
    margin: 10,
    paddingLeft: 10,
  },
  KeyboardAvoidingView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    justifyContent: "center",
    alignSelf: "center",
    fontSize: 30,
    color: "#ff5722",
    margin: 25,
  },
  modalContainer: {
    flex: 1,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffff",
    marginRight: 30,
    marginLeft: 30,
    marginTop: 80,
    marginBottom: 80,
  },
  formTextInput: {
    width: "75%",
    height: 35,
    alignSelf: "center",
    borderColor: "#ffab91",
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 10,
    padding: 10,
  },
  registerButton: {
    width: 200,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 30,
  },
  registerButtonText: {
    color: "#ff5722",
    fontSize: 15,
    fontWeight: "bold",
  },
  cancelButton: {
    width: 200,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },
  button: {
    width: 300,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
    backgroundColor: "#ff9800",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10.32,
    elevation: 16,
    padding: 10,
  },
  buttonText: {
    color: "#ffff",
    fontWeight: "200",
    fontSize: 20,
  },
});
