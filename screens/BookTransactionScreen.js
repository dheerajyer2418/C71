import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet, TextInput} from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as firebase from 'firebase';
import db from '../config.js'

export default class TransactionScreen extends React.Component {
    constructor(){
      super();
      this.state = {
        hasCameraPermissions: null,
        scanned: false,
        scannedData: '',
        buttonState: 'normal',
        scannedBookId: '',
        scannedStudentId: ''
      }
    }

    getCameraPermissions = async (id) =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      
      this.setState({
        /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
        hasCameraPermissions: status === "granted",
        buttonState: id,
        scanned: false
      });
    }

    handleBarCodeScanned = async({type, data})=>{
      this.setState({
        scanned: true,
        scannedData: data,
        buttonState: 'normal'
      });
    }
    handleTransaction =()=>{
      var transactionMessage = db.collection("Books").doc(this.state.scannedBookId()).get()
      .then((doc)=>{
        var book = doc.data();
        if(book.bookAvailability){
          this.initiateBookIssue();
          transactionMessage = "Book Issued"
        }else{
          this.initiateBookReturn();
          transactionMessage = "Book Returned"
        }
      })
      this.setState({
        transactionMessage:transactionMessage
        
      })
    }
    initiateBookIssue = async ()=>{
      //add a transaction
      db.collection("transaction").add({
        'studentId' : this.state.scannedStudentId,
        'bookId' : this.state.scannedBookId,
        'data' : firebase.firestore.Timestamp.now().toDate(),
        'transactionType' : "Issue"
      })
  
      //change book status
      db.collection("books").doc(this.state.scannedBookId).update({
        'bookAvailability' : false
      })
      //change number of issued books for student
      db.collection("students").doc(this.state.scannedStudentId).update({
        'numberOfBooksIssued' : firebase.firestore.FieldValue.increment(1)
      })
  
      this.setState({
        scannedStudentId : '',
        scannedBookId: ''
      })
    }
  
    initiateBookReturn = async ()=>{
      //add a transaction
      db.collection("transactions").add({
        'studentId' : this.state.scannedStudentId,
        'bookId' : this.state.scannedBookId,
        'date'   : firebase.firestore.Timestamp.now().toDate(),
        'transactionType' : "Return"
      })
      //change book status
    db.collection("books").doc(this.state.scannedBookId).update({
      'bookAvailability' : true
    })

    //change book status
    db.collection("students").doc(this.state.scannedStudentId).update({
      'numberOfBooksIssued' : firebase.firestore.FieldValue.increment(-1)
    })

    this.setState({
      scannedStudentId : '',
      scannedBookId : ''
    })
  }

    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;

      if (buttonState !== "normal" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          <View style={styles.container}>
            <View>
              <Image source={require('../assets/booklogo.jpg')} style ={{width: 200, height: 200}}/>
              <Text style ={{textAlign: 'center', fontSize: 30}}>
                Wily
              </Text>
            </View>
            <View style ={styles.inputView}>
              <TextInput style ={styles.inputBox} placeholder = "Book Id" 
                value ={this.state.scannedBookId}
              />
              <TouchableOpacity
                style={styles.scanButton}
                onPress = {()=>{
                  this.getCameraPermissions("Book Id")
                }}
              >
                <Text style={styles.buttonText}>Scan</Text>
              </TouchableOpacity>
            </View>
            <View style ={styles.inputView}>
              <TextInput style ={styles.inputBox} placeholder = "Student Id"
                value ={this.state.scannedStudentId}
              />
              <TouchableOpacity
                style={styles.scanButton}
                onPress = {()=>{
                  this.getCameraPermissions("Student Id")
                }}
                >
                <Text style={styles.buttonText}>Scan</Text>
              </TouchableOpacity>
              <TouchableOpacity style ={styles.submitButton} onPress ={async()=>{this.handleTransaction()}}>
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
        </View>
        );
      }
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10,
    },
    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20,
    },
    scan:{
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0,
      backgroundColor: '#66bb6a',
    },
    submitButton:{
      width: 100,
      height: 50,
      backgroundColor: '#fbc02d',
    },
    submitButtonText:{
      padding: 10,
      textAlign: 'center',
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white'
    },
  });