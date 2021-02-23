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
import { ListItem } from "react-native-elements";
import db from "../config";
import firebase from "firebase";

export default class MyDonationScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      allDonations: [],
      userID: firebase.auth().currentUser.email,
      donorName: "",
    };
    this.requestRef = null;
  }

  getAllDonations = () => {
    this.requestRef = db
      .collection("allDonations")
      .where("donorID", "==", this.state.userID)
      .onSnapshot((Snapshot) => {
        var allDonations = [];
        Snapshot.docs.map((doc) => {
          var donation = doc.data();
          donation["docID"] = doc.id;
          allDonations.push(donation);
        });
        this.setState({
          allDonations: allDonations,
        });
      });
  };

  sendBook = (bookDetails) => {
    if (bookDetails.requestStatus == "Book Sent") {
      var requestStatus = "Donor Interested";
      db.collection("allDonations").doc(bookDetails.docID).update({
        requestStatus: "Donor Interested",
      });
      this.sendNotification(bookDetails, requestStatus);
    } else {
      var requestStatus = "Book Sent";
      db.collection("allDonations").doc(bookDetails.docID).update({
        requestStatus: "Book Sent",
      });

      this.sendNotification(bookDetails, requestStatus);
    }
  };

  sendNotification = (bookDetails, requestStatus) => {
    var requestID = bookDetails.requestID;
    var donorID = bookDetails.donorID;
    db.collection("allNotifications")
      .where("requestID", "==", requestID)
      .where("donorID", "==", donorID)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          var message = "";
          if (requestStatus == "Book Sent") {
            message = this.state.donorName + " "+ "has sent you the book.";
          } else {
            message =
              this.state.donorName + " " + "has shown interest donating the book.";
          }
          db.collection("allNotifications").doc(doc.id).update({
            message: message,
            notificationStatus: "unread",
            date: firebase.firestore.FieldValue.serverTimestamp(),
          });
        });
      });
  };

  getUserDetails = (userID) => {
    db.collection("users")
      .where("emailID", "==", userID)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          this.setState({
            donorName: doc.data().firstName + " " + doc.data().lastName,
          });
        });
      });
  };

  componentDidMount() {
    this.getAllDonations();
    this.getUserDetails(this.state.userID);
  }

  componentWillUnmount() {
    this.requestRef();
  }

  keyExtractor = (item, index) => index.toString();

  renderItem = ({ item, index }) => {
    return (
      <ListItem key={index} bottomDivider>
        <ListItem.Content>
          <ListItem.Title>{item.bookName}</ListItem.Title>
          <ListItem.Subtitle>
            {"Requested By: " +
              item.requestedBy +
              "\nStatus: " +
              item.requestStatus}
          </ListItem.Subtitle>
          <TouchableOpacity style={styles.button}>
            <Text
              style={{ color: "#FFFFFF" }}
              onPress={() => {
                this.sendBook(item);
              }}
            >
              Send Book
            </Text>
          </TouchableOpacity>
        </ListItem.Content>
      </ListItem>
    );
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        <MyHeader title={"My Donations"} navigation={this.props.navigation} />
        <View style={{ flex: 1 }}>
          {this.state.allDonations.length == 0 ? (
            <View style={styles.subContainer}>
              <Text style={{ fontSize: 20 }}>List Of All Book Donations</Text>
            </View>
          ) : (
            <FlatList
              data={this.state.allDonations}
              keyExtractor={this.keyExtractor}
              renderItem={this.renderItem}
            ></FlatList>
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  subContainer: {
    flex: 1,
    fontSize: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    width: 100,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ff5722",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
  },
});
