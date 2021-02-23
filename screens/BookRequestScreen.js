import * as React from "react";
import MyHeader from "../components/MyHeader";
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

export default class BookRequestScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      userID: firebase.auth().currentUser.email,
      bookName: "",
      reasonToRequest: "",
      isBookRequestActive: "",
      requestedBookName: "",
      bookStatus: "",
      requestID: "",
      userDocID: "",
      docID: "",
    };
  }

  createUniqueID() {
    return Math.random().toString(36).substring(7);
  }

  addRequest = async (bookName, reasonToRequest) => {
    var userID = this.state.userID;
    var randomRequestID = this.createUniqueID();
    db.collection("requestedBooks").add({
      userID: userID,
      bookName: bookName,
      reasonToRequest: reasonToRequest,
      requestID: randomRequestID,
      bookStatus: "requested",
      date: firebase.firestore.FieldValue.serverTimestamp(),
    });

    await this.getBookRequest();
    db.collection("users")
      .where("emailID", "==", this.state.userID)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          db.collection("users")
            .doc(doc.id)
            .update({ isBookRequestActive: true });
        });
      });

    this.setState({
      bookName: "",
      reasonToRequest: "",
      requestID: randomRequestID
    });
    Alert.alert("Book Request Successfull");
  };

  receivedBooks = (bookName) => {
    var userID = this.state.userID;
    var requestID = this.state.requestID;
    db.collection("receivedBooks").add({
      userID: userID,
      bookName: bookName,
      requestID: requestID,
      bookStatus: "received",
    });
  };

  getIsBookRequestActive() {
    db.collection("users")
      .where("emailID", "==", this.state.userID)
      .onSnapshot((snapshot) => {
        snapshot.forEach((doc) => {
          this.setState({
            isBookRequestActive: doc.data().isBookRequestActive,
            userDocID: doc.id,
          });
        });
      });
  }

  getBookRequest = () => {
    var bookRequest = db.collection("requestedBooks")
      .where("userID", "==", this.state.userID)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          if (doc.data().bookStatus !== "received") {
            this.setState({
              requestID: doc.data().requestID,
              requestedBookName: doc.data().bookName,
              bookStatus: doc.data().bookStatus,
              docID: doc.id,
            });
          }
        });
      });
  };

  sendNotification = () => {
    db.collection("users")
      .where("emailID", "==", this.state.userID)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          var name = doc.data().firstName;
          var lastName = doc.data().lastName;

          db.collection("allNotifications")
            .where("requestID", "==", this.state.requestID)
            .get()
            .then((snapshot) => {
              snapshot.forEach((doc) => {
                var donorID = doc.data().donorID;
                var bookName = doc.data().bookName;

                db.collection("allNotifications").add({
                  targetedUserID: donorID,
                  notificationStatus: "unread",
                  message:
                    name + " " + lastName + " has received the book " + bookName,
                  bookName: bookName,
                });
              });
            });
        });
      });
  };

  componentDidMount() {
    this.getBookRequest();
    this.getIsBookRequestActive();
  }

  updateBookRequestStatus = () => {
    db.collection("requestedBooks").doc(this.state.docID).update({
      bookStatus: "received",
    });

    db.collection("users")
      .where("emailID", "==", this.state.userID)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          db.collection("users").doc(doc.id).update({
            isBookRequestActive: false,
          });
        });
      });
  };

  render() {
    if (this.state.isBookRequestActive == true) {
      return (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <View
            style={{
              borderColor: "orange",
              borderWidth: 2,
              justifyContent: "center",
              alignItems: "center",
              padding: 10,
              margin: 10,
            }}
          >
            <Text>Book Name</Text>
            <Text>{this.state.requestedBookName}</Text>
          </View>
          <View
            style={{
              borderColor: "orange",
              borderWidth: 2,
              justifyContent: "center",
              alignItems: "center",
              padding: 10,
              margin: 10,
            }}
          >
            <Text>Book Status</Text>
            <Text style={{ color: "green" }}>{this.state.bookStatus}</Text>
          </View>
          <TouchableOpacity
            style={{
              borderWidth: 4,
              borderColor: "#FA8223",
              backgroundColor: "#FBB124",
              width: 300,
              alignSelf: "center",
              alignItems: "center",
              height: 40,
              marginTop: 30,
              justifyContent: "center",
            }}
            onPress={() => {
              this.sendNotification();
              this.updateBookRequestStatus();
              this.receivedBooks(this.state.requestedBookName);
            }}
          >
            <Text>Book Received</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <View style={{ flex: 1 }}>
          <MyHeader title={"Request Book"} navigation={this.props.navigation} />
          <KeyboardAvoidingView style={styles.keyBoardStyle}>
            <TextInput
              style={styles.formTextInput}
              placeholder={"Enter Book Name"}
              onChangeText={(text) => {
                this.setState({ bookName: text });
              }}
              value={this.state.bookName}
            />
            <TextInput
              style={[
                styles.formTextInput,
                { height: 300, textAlignVertical: "top" },
              ]}
              placeholder={"Enter your Reason"}
              onChangeText={(text) => {
                this.setState({ reasonToRequest: text });
              }}
              value={this.state.reasonToRequest}
              multiline
              numberOfLines={8}
              maxLength={594}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                this.addRequest(
                  this.state.bookName,
                  this.state.reasonToRequest
                );
              }}
            >
              <Text>Request Book</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  keyBoardStyle: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  formTextInput: {
    width: "75%",
    height: 35,
    alignSelf: "center",
    borderColor: "#ffab91",
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 20,
    padding: 10,
  },
  button: {
    width: "75%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#ff5722",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
    marginTop: 20,
  },
});
