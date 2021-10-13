
import {
  FETCH_CHATDATA,
  FETCH_CHATDATA_REQUEST,
  FETCH_CHATDATA_SUCCESS,
  FETCH_CHATDATA_FAILURE,
  ADD_BOT_CHATMSG,
  GET_BOT_RESPONSE,
  CHAGNE_CROOM_ID,
  CHAGNE_PROOM_ID,
  CLEAR_CHAT_LIST,
} from './botChatTypes';

// const fetChatData = () => {
//     return (dispatch) => {
//         // fetch("url")
//         // .then(response => response.json())
//         // .then(chatData =>console.log(chatData))
//         // .catch(error=>console.log(error))
//     }
// }

export const clearChatList = () => {
  return{
    type:CLEAR_CHAT_LIST,
  }
}

export const changeCRoomId = (id) => {
  return{
    type:CHAGNE_CROOM_ID,
    data:{cRoomId : id}
  }
}

export const changePRoomId = (id) => {
  return{
    type:CHAGNE_PROOM_ID,
    data:{pRoomId : id}
  }
}

export const fetchChatData = () => {
    return {
        type: FETCH_CHATDATA_SUCCESS,
    };
}

export const addMsgData = (id, sender,msg) => {
  
    return{
      type: ADD_BOT_CHATMSG,
      data:{id:id,sender: sender, msg: msg}
    };
}

export const getBotResponse = (msg) => {

  return{
    type: GET_BOT_RESPONSE,
    data:{
      msg:msg
    }
  }
}
