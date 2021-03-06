import React, { useState, useEffect, useRef, useSelector } from 'react';
import VerticalHeader from './VerticalHeader';
import HorizontalHeader from './HorizontalHeader';
import { Link } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import axios from 'axios';
import { API_BASE_URL } from './utils/Constant';
import { useLocation } from 'react-router';
import {
  addMsgData,
  addRoomData,
  fetchChatData,
  changeNowRoomId,
  clearTaChatList,
  clearTaChatRoomList,
  changeCheckedState,
  updateTAChatroomList,
} from '../redux/chat/ta_chat/taChatActions';
import {
  changeUserId,
  changeUserName,
  changeType,
  onLoginSuccess,
} from '../redux/login/loginActions';
import '../css/Chatroom.css';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { LOGIN_ORIGIN, LOGIN_BEFORE } from '../redux/login/loginTypes';
import { changeLoadingState } from '../redux/view/viewActions';
import { root2 } from './Root2';
import ChatRoomDeniedModal from './modal/ChatRoomDeniedModal';
import ChatRoomAddingModal from './modal/ChatRoomAddingModal';
import CodeMsgModal from './modal/CodeMsgModal';
import Root from './Root';
import { clearChatList } from '../redux/chat/bot_chat/botChatActions';
import { getTime } from './utils/ChatUtils';

//const sockJS = new SockJS(API_BASE_URL + '/websocket');
//const stomp = Stomp.over(sockJS);
const stomp = Stomp.over(() => new SockJS(API_BASE_URL + '/websocket'));
const stomp2 = Stomp.over(() => new SockJS(API_BASE_URL + '/websocket2'));

const TaChatRoom = ({
  loginState,
  userId,
  userName,
  num,
  roomNum,
  nowRoomId,
  chatsData,
  list,
  addMsgData,
  addRoomData,
  history,
  changeUserId,
  changeUserName,
  changeNowRoomId,
  changeCheckedState,
  clearTaChatList,
  clearTaChatRoomList,
  updateTAChatroomList,

  onLoginSuccess,
  changeType,
  changeLoadingState,
}) => {
  const msgInput = useRef();
  const scrollRef = useRef();
  const [isTa, setTa] = useState(false);
  const [modalOn, setModalOn] = useState(false);
  const [codeModalOn, setCodeModalOn] = useState(false);
  const [roomPlusmodalOn, setRoomPlusModalOn] = useState(false);
  const { pathname } = useLocation();

  const [codeMsg, setCodeMsg] = useState('');

  // ??? ???????????? api??? ????????? ????????? ???????????? ?????? useEffect
  const [isRoomListUpdated, setRoomListUpdated] = useState(false);
  // ??? ???????????? ??????????????? ?????????.
  const [isSelectedRoomUpdated, setSelectedRoomUpdated] = useState(false);
  const [isChangedPage, setChangedPage] = useState(false);

  useEffect(() => {
    // ????????? ?????????????????? ??????.

    const auth = async () => {
      const result = await root2(
        onLoginSuccess,
        changeType,
        changeLoadingState,
      );

      if (result === 'success') {
        changeLoadingState(true);
        getIsTa();
      }
    };

    auth();

    return () => {
      setChangedPage(true);

      clearTaChatRoomList();
      clearTaChatList();
      stomp.disconnect();
    };
  }, [pathname]);

  useEffect(() => {
    scrollToBottom();
  }, [chatsData]);

  useEffect(() => {
    stomp2.disconnect();
  }, [isChangedPage]);

  useEffect(() => {
    if (list.length !== 0) {
      //console.log(list);
      connectStomp(list);
    }
  }, [isRoomListUpdated]);

  useEffect(() => {
    if (list.length !== 0 && isSelectedRoomUpdated) {
      connectStomp2(nowRoomId);
    }
  }, [isSelectedRoomUpdated]);

  function BotChatMsgItem({ msg, name, time }) {
    let isCodeMsg = msg.includes('----- ?????? -----');
    let st = 'botSenderContent';
    let code = '';
    if (isCodeMsg) {
      code = msg;
      st = 'botSenderCodeContent';
      msg = '????????? ??????????????????.\n???????????? ???????????? ????????? ???????????????.';
    }

    return (
      <li className="botMsg">
        <img src="img/taman.png"/>

        <div className="botMsgBox">
          <p className="botSenderName">{name}</p>
          <div className="botSenderMainBox">
            <p className="botSenderTime">{time}</p>
            <p className="botSenderContent"
              onClick={() => {
                if (isCodeMsg) {
                  setCodeModalOn(true);
                  setCodeMsg(code);
                }
              }}
              className={st}
            >
              {msg}
            </p>
          </div>
        </div>
      </li>
    );
  }

  function UserChatMsgItem({ msg, name, time }) {
    let isCodeMsg = msg.includes('----- ?????? -----');
    let st = 'senderContent';
    let code = '';
    if (isCodeMsg) {
      code = msg;
      st = 'senderCodeContent';
      msg = '????????? ??????????????????.\n???????????? ???????????? ????????? ???????????????.';
    }

    return (
      <li className="userMsg">
        <div className="userMsgBox">
          <p className="senderName">???</p>
          <div>
            <p className="senderTime">{time}</p>
            <p
              onClick={() => {
                if (isCodeMsg) {
                  setCodeModalOn(true);
                  setCodeMsg(code);
                }
              }}
              className={st}
            >
              {msg}
            </p>
          </div>
        </div>
      </li>
    );
  }

  const chatData = () => {
    const chatItems = chatsData.map((chat) => {
      let tempName = chat.name;
      if (!isTa) {
        tempName = 'TA ' + chat.name;
      }

      if (chat.userId === userId) {
        return (
          <UserChatMsgItem msg={chat.msg} key={chat.id} time={chat.time} />
        );
      } else {
        return (
          <BotChatMsgItem
            msg={chat.msg}
            name={tempName}
            time={chat.time}
            key={chat.id}
          />
        );
      }
    });

    return <>{chatItems}</>;
  };

  const listData = () => {
    const listItems = list.map((item) => {
      let st = 'nonSelectedRoomLi';

      if (String(nowRoomId) === String(item.roomId)) {
        st = 'selectedRoomLi';
      }
      return (
        <li
          className={st}
          key={item.id}
          // ????????? ?????? onClick
          onClick={() => {
            changeLoadingState(true);
            clearTaChatList();

            // enter?????? ???????????? ????????? ?????? ????????? 1??? ??????. list[item.id - 1]
            updateChatReadState(item.roomId);
            setRoomIdSession(item.roomId);

            // ??????????????? nowRoomId??? false??? ??????.
            changeCheckedState(nowRoomId, false);
            changeCheckedState(item.roomId, false);
            changeNowRoomId(item.roomId);
            getChatList(item.roomId);
            stomp2.deactivate({ type1: 'clicked' });
          }}
        >
          <div>
            <p>{item.title}</p>
            <>
              {item.isChecked && item.roomId !== nowRoomId ? (
                <p className="secondNavRoomNewP" style={{ color: 'red' }}>
                  New
                </p>
              ) : (
                ''
              )}
            </>
          </div>
          <p className="secondNavRoomDes">{item.des}</p>
        </li>
      );
    });

    return <>{listItems}</>;
  };

  const getIsTa = () => {
    axios
      .post(
        API_BASE_URL + '/user/assistant',
        {},
        {
          headers: {
            'Content-type': 'application/json',
            Accept: 'application/json',
          },
          withCredentials: true,
        },
      )
      .then((res) => {
        changeUserId(res.data.id);
        changeUserName(res.data.name);

        if (res.data.isAssistant === '1') {
          setTa(true);
        }

        getChatRoomList(res.data.isAssistant, res.data.studentNumber);
      })
      .catch((res) => {
        console.log(res);
        changeLoadingState(false);
        alert('????????? ????????? ??????????????????. ?????? ??????????????????.');
      });
  };

  const getChatRoomList = (isTa, studentNumber) => {
    axios
      .post(
        API_BASE_URL + '/room/studentId',
        {},
        {
          headers: {
            'Content-type': 'application/json',
            Accept: 'application/json',
          },
          withCredentials: true,
        },
      )
      .then((res) => {
        console.log(res.data.roomIdList);

        // ???????????? ?????? ??????.
        if (res.data.room.length === 0) {
          changeLoadingState(false);
          return;
        }

        // room id ???????????? ??????
        let roomList = [];

        for (let i = 0; i < res.data.room.length; i++) {
          let otherName;
          if (String(res.data.room[i].user.studentNumber) === studentNumber) {
            otherName = res.data.room[i].user2.name;
          } else {
            otherName = res.data.room[i].user.name;
          }

          // ?????? ????????? TA??? ????????? ?????? ?????? ?????? UI??? ??????.
          let name;
          if (isTa === '1') {
            name = otherName + ' ??????';
          } else {
            name = 'TA ' + otherName;
          }

          let isNewChatRoom = false;
          // checked true or false ??????
          for (let j = 0; j < res.data.roomIdList.length; j++) {
            if (
              String(res.data.room[i].id) === String(res.data.roomIdList[j])
            ) {
              isNewChatRoom = true;
            }
          }

          addRoomData(
            roomNum,
            res.data.room[i].id,
            res.data.room[i].title,
            name,
            isNewChatRoom,
          );
          roomList.push(res.data.room[i].id);
        }
        // ?????? ????????? ???????????? ?????? ?????? ????????????.

        // updated ????????? connect??? -> useEffect?????? ???????????? ??????.
        setRoomListUpdated(true);

        getRoomIdSession().then((nowRoomId) => {
          getChatList(nowRoomId, studentNumber);
          changeCheckedState(nowRoomId, false);
          //connectStomp(roomList);
        });
      })
      .catch((res) => {
        console.log(res);
        changeLoadingState(false);
        alert('????????? ????????? ??????????????????. ?????? ??????????????????.');
      });
  };

  const getChatList = (roomId) => {
    axios
      .post(
        API_BASE_URL + '/chat/roomId/' + roomId,
        {},
        {
          headers: {
            'Content-type': 'application/json',
            Accept: 'application/json',
          },
          withCredentials: true,
        },
      )
      .then((res) => {
        for (let i = 0; i < res.data.length; i++) {
          //console.log(res.data[i].message);
          addMsgData(
            num,
            res.data[i].user.name,
            res.data[i].user.id,
            res.data[i].message,
            getTime(res.data[i].createTime),
          );
        }
        scrollToBottom();
        changeLoadingState(false);
      })
      .catch((res) => {
        console.log(res);
        changeLoadingState(false);
        alert('????????? ????????? ??????????????????. ?????? ??????????????????.');
      });
  };

  const connectStomp = (roomList) => {
    changeLoadingState(true);
    stomp.connect(
      {},
      () => {
        for (let i = 0; i < roomList.length; i++) {
          // subscribe ????????? ?????? ?????? ??????
          stomp.subscribe('/sub/chat/room/' + roomList[i].roomId, (chat) => {
            var content = JSON.parse(chat.body);

            for (let i = 0; i < list.length; i++) {
              if (list[i].roomId == content.roomId) {
                changeCheckedState(content.roomId, true);
              }
            }

            updateTAChatroomList(content.roomId);

            // getRoomIdSession().then((nowRoomId) => {
            //   if (nowRoomId !== content.roomId) {
            //     for (let i = 0; i < list.length; i++) {
            //       if (list[i].roomId == content.roomId) {
            //         //console.log(list[i].roomId + ' // ' + roomId);
            //         changeCheckedState(content.roomId, true);
            //       }
            //     }
            //   }
            // });
          });
        }

        // ??? ???????????? ????????? ????????? ?????? ???????????? ??????????????? connect??????.
        setSelectedRoomUpdated(true);
        changeLoadingState(false);
      },
      // onErrorCallback
      () => {
        changeLoadingState(false);
        alert('????????? ????????? ??????????????????. ?????? ??????????????????.');
      },
    );
  };

  const connectStomp2 = (nowRoomId) => {
    changeLoadingState(true);
    stomp2.connect(
      {},
      // connectCallback
      () => {
        stomp2.subscribe('/sub/chat/room2/' + nowRoomId, (chat) => {
          var content = JSON.parse(chat.body);

          let date = getTime(content.createTime);
          addMsgData(num, content.name, content.userId, content.message, date);
        });

        changeLoadingState(false);
        setSelectedRoomUpdated(false);
      },
      // onErrorCallback
      () => {
        changeLoadingState(false);
        alert('????????? ????????? ??????????????????. ?????? ??????????????????.');
      },
      //closeEventCallback
      () => {
        console.log(nowRoomId);
        console.log(isChangedPage);

        // disconnect?????? ???????????? ????????? ?????? ????????? 1??? ??????.
        updateChatReadState(nowRoomId);

        // ??? ???????????? ????????? ????????? ?????? ???????????? ??????????????? connect??????.
        setSelectedRoomUpdated(true);
        changeLoadingState(false);
      },
    );
  };

  const getRoomIdSession = async function () {
    let roomId = await axios
      .post(
        API_BASE_URL + '/room/roomSessionId',
        {},
        {
          headers: {
            'Content-Type': `application/json`,
          },
          withCredentials: true,
        },
      )
      .then((res) => {
        changeNowRoomId(res.data);
        return res.data;
      })
      .catch((res) => {
        console.log(res);
        alert('????????? ????????? ??????????????????. ?????? ??????????????????.');
      });
    return roomId;
  };

  const setRoomIdSession = async function (roomId) {
    await axios
      .post(
        API_BASE_URL + '/room/roomSessionId/' + roomId,
        {},
        {
          headers: {
            'Content-Type': `application/json`,
          },
          withCredentials: true,
        },
      )
      .catch((res) => {
        console.log(res);
        alert('????????? ????????? ??????????????????. ?????? ??????????????????.');
      });
  };

  const scrollToBottom = () => {
    if (scrollRef) {
      scrollRef.current.scrollIntoView({ behavior: 'auto' });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMsg();
    }
  };

  function sendMsg() {
    const text = msgInput.current.value;

    if (text === '') {
      return;
    }
    console.log(nowRoomId);
    stomp.send(
      '/pub/chat/message',
      {},
      JSON.stringify({
        roomId: nowRoomId,
        name: userName,
        userId: userId,
        message: text,
        chatRead: 0,
      }),
    );

    stomp2.send(
      '/pub/chat/message2',
      {},
      JSON.stringify({
        roomId: nowRoomId,
        name: userName,
        userId: userId,
        message: text,
        chatRead: 0,
      }),
    );
    updateTAChatroomList(nowRoomId);

    msgInput.current.value = '';
  }

  const updateChatReadState = (roomId) => {
    axios
      .post(
        API_BASE_URL + '/room/readStatus',
        { roomId: roomId },
        {
          headers: {
            'Content-type': 'application/json',
            Accept: 'application/json',
          },
          withCredentials: true,
        },
      )
      .then((res) => {})
      .catch((res) => {
        console.log(res);
        alert('????????? ????????? ??????????????????. ?????? ??????????????????.');
      });
  };

  return (
    <div style={{ width: '100%' }}>
      <VerticalHeader />
      <HorizontalHeader />

      <>{modalOn ? <ChatRoomDeniedModal setModalOn={setModalOn} /> : ''}</>

      <>
        {codeModalOn ? (
          <CodeMsgModal setModalOn={setCodeModalOn} msg={codeMsg} />
        ) : (
          ''
        )}
      </>

      <>
        {roomPlusmodalOn ? (
          <ChatRoomAddingModal
            setModalOn={setRoomPlusModalOn}
            userId={userId}
          />
        ) : (
          ''
        )}
      </>

      <div id="chatRoomBody">
        <div id="emptySpace1" />

        <div className="secondHorizontalNav">
          <div id="navInnerDiv">
            <h3 style={{ color: '#008cff' }}> ????????? ??????</h3>
            <div
              onClick={() => {
                if (!isTa) {
                  setModalOn(true);
                } else {
                  setRoomPlusModalOn(true);
                }
              }}
            >
              +
            </div>
          </div>
          <div className="navInner2Div">
            <div>{listData()}</div>
          </div>
        </div>

        <div id="mainChatting">
          <h3 style={{ color: '#008cff' }}>????????????</h3>

          <div id="taChattingSpace">
            {chatData()}
            <div ref={scrollRef}></div>
          </div>

          <div id="inputForm">
            <input
              id="taMsgInput"
              ref={msgInput} //border: solid 2px #990000;
              onKeyPress={handleKeyPress}
            ></input>
            <button id="taMsgBnt" onClick={() => sendMsg()}>
              ??? ???
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = ({ taChats, login }) => {
  //console.log(taChats.chats);

  return {
    chatsData: taChats.chats,
    list: taChats.list,
    num: taChats.num,
    roomNum: taChats.roomNum,
    nowRoomId: taChats.nowRoomId,
    loginState: login.type,
    userName: login.userName,
    userId: login.userId,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchChatData: () => dispatch(fetchChatData()),
    addMsgData: (id, name, userId, msg, time) =>
      dispatch(addMsgData(id, name, userId, msg, time)),
    addRoomData: (id, roomId, title, des, isChecked) =>
      dispatch(addRoomData(id, roomId, title, des, isChecked)),
    getBotResponse: (msg) => dispatch(getBotResponse(msg)),
    changeUserId: (id) => dispatch(changeUserId(id)),
    changeUserName: (name) => dispatch(changeUserName(name)),
    changeNowRoomId: (nowRoomId) => dispatch(changeNowRoomId(nowRoomId)),
    changeCheckedState: (roomId, isChecked) =>
      dispatch(changeCheckedState(roomId, isChecked)),
    clearTaChatList: () => dispatch(clearTaChatList()),
    clearTaChatRoomList: () => dispatch(clearTaChatRoomList()),
    updateTAChatroomList: (index) => dispatch(updateTAChatroomList(index)),

    changeType: (type) => dispatch(changeType(type)),
    changeLoadingState: (props) => dispatch(changeLoadingState(props)),
    onLoginSuccess: (props) => dispatch(onLoginSuccess(props)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TaChatRoom);
