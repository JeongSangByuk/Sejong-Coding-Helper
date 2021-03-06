import React, { useState } from 'react';
import ReactModal from 'react-modal';
import reactDom from 'react-dom';
import '../../css/modal/RoomAddingModal.css';
import { LOGIN_BEFORE } from '../../redux/login/loginTypes';
import axios from 'axios';
import { API_BASE_URL } from '../utils/Constant';
import { changeLoadingState } from '../../redux/view/viewActions';

const ChatRoomAddingModal = ({ setModalOn,userId }) => {
  const [title, setTitle] = useState('');
  const [professorName, setProfessorName] = useState('');
  const [stuNums, setStuNums] = useState('');

  const createChatRoom = () => {
    if (title.trim() === '' || professorName.trim() === '' || stuNums.trim() === '') {
      alert('πββ μλ ₯μΉΈμ μ λΆ μλ ₯ν΄μ£ΌμΈμ. ββπ');
      return;
    }
    const reg_stunum = /^[0-9]{8}$/;

    let stuNumArr = stuNums.split('\n');
    for (let element of stuNumArr) {

      if (!reg_stunum.test(element)) {
        alert('πββ μ¬λ°λ₯΄μ§ μμ νλ²μ΄ μμ΅λλ€. λ€μ μλ ₯ν΄μ£ΌμΈμ. ββπ');
        return;
      }
      console.log(element);
    }

    axios
      .post(
        API_BASE_URL + '/assistant/studentNumbers/' + String(userId),
        {roomName : title, professorName:professorName, studentNumbers:stuNumArr},
        {
          headers: {
            'Content-Type': `application/json`,
          },
          withCredentials: true,
        },
      )
      .then((res)=>{
        if(res.data === 'success'){
          alert('βββ μ±νλ°© μΆκ° μ±κ³΅ βββ');
          setModalOn(false);
          window.location.replace("/tachatroom");
        }
      })
      .catch((res) => {
        console.log(res);
        alert('μΌμμ  μ€λ₯κ° λ°μνμ΅λλ€. λ€μ μλν΄μ£ΌμΈμ.');
      });


  };

  return (
    <div className="roomAddingmodal">
      <div className="bg" />
      <div className="roomAddingmodalBox">
        <p className="modalTitle">μ±νλ°© μμ±</p>

        <div className="oneRow">
          <p>κ³Όλͺ©λͺ</p>
          <input
            placeholder="νλ‘κ·Έλλ° μλ¬Έ P"
            onChange={(e) => {
              setTitle(e.target.value);
            }}
          ></input>
        </div>

        <div className="oneRow">
          <p>κ΅μλͺ</p>
          <input
            placeholder="νκΈΈλ"
            onChange={(e) => {
              setProfessorName(e.target.value);
            }}
          ></input>
        </div>

        <div className="secondRow">
          <p>ν λ²</p>
          <textarea
            placeholder="170123123&#13;&#10;180123123&#13;&#10;190123123"
            onChange={(e) => {
              setStuNums(e.target.value);
            }}
          ></textarea>
        </div>
        <p id="textAreaTip">
          β» μκ°μ νλ²μ μλ ₯ν΄μ£ΌμΈμ. <u>ν νλ²λ§λ€ μ€λ°κΏμ ν΄μ£ΌμΈμ.</u>
        </p>
        <p id="textAreaTip">
          β» μ΄λ―Έ μ±νλ°©μ΄ μ‘΄μ¬νλ νλ²μ μΆκ°λ‘ μ±νλ°©μ΄ μμ±λμ§ μμ΅λλ€.
        </p>

        <div className="cuttingLine"></div>
        <div className="bntGroup">
          <button
            style={{ color: '#ff7777' }}
            onClick={() => {
              setModalOn(false);
            }}
          >
            μ·¨ μ
          </button>
          <button
            onClick={() => {
              createChatRoom();
            }}
          >
            ν μΈ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoomAddingModal;
