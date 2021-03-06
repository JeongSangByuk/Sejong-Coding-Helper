import React, { useState } from 'react';
import ReactModal from 'react-modal';
import reactDom from 'react-dom';
import '../../css/modal/RoomAddingModal.css';
import { LOGIN_BEFORE } from '../../redux/login/loginTypes';
import axios from 'axios';
import { API_BASE_URL } from '../utils/Constant';

const PwSearchModal = ({ setModalOn,changeLoadingState }) => {
  const [studentNumber, setStudentNumber] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const reg_name = /^[κ°-ν£]{2,5}$/;
  const reg_stunum = /^[0-9]{8}$/;

  const sendEmail = () => {

    if (studentNumber === '' || name === '' || email === '') {
      alert('πββ μλ ₯μΉΈμ μ λΆ μλ ₯ν΄μ£ΌμΈμ. ββπ');
      return;
    }

    if (!reg_name.test(name)) {
      alert('πββ μ΄λ¦μ λ€μ νμΈν΄μ£ΌμΈμ. ββπ');
      return;
    }

    if (!reg_stunum.test(studentNumber)) {
      alert('πββ μμ΄λ(νλ²)λ₯Ό λ€μ νμΈν΄μ£ΌμΈμ. ββπ');
      return;
    }

    changeLoadingState(true);

    axios
      .post(
        API_BASE_URL + '/search/pw',
        { studentNumber: studentNumber, name: name, email:email },
        {
          headers: {
            'Content-type': 'application/json',
            Accept: 'application/json',
          },
          withCredentials: true,
        },
      )
      .then((res) => {

        changeLoadingState(false);
        setModalOn(false);
        alert('β μμ λΉλ° λ²νΈ λ°κΈμ μ±κ³΅νμ΅λλ€. λ©μΌν¨μ νμΈν΄λ³΄μΈμ. β');
      })
      .catch((res) => {
        console.log(res);
        alert('πββ μΌμΉνλ νμ μ λ³΄κ° μμ΅λλ€. ββπ');
      });
  };

  return (
    <div className="roomAddingmodal">
      <div className="bg" />
      <div className="roomAddingmodalBox">
        <p className="modalTitle">λΉλ°λ²νΈ μ°ΎκΈ°</p>

        <div className="oneRow">
          <p style={{ width: '130px', marginTop: '12px' }}>μμ΄λ(νλ²)</p>
          <input
            style={{ width: '230px' }}
            onChange={(e) => {
              setStudentNumber(e.target.value);
            }}
          ></input>
        </div>

        <div className="oneRow">
          <p style={{ width: '130px', marginTop: '12px' }}>μ΄ λ¦</p>
          <input
            style={{ width: '230px' }}
            onChange={(e) => {
              setName(e.target.value);
            }}
          ></input>
        </div>

        <div className="oneRow">
          <p style={{ width: '130px', marginTop: '12px' }}>μΈμ’λ μ΄λ©μΌ</p>
          <input
            style={{ width: '130px', marginRight:'0px' }}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          ></input>
          <p style={{ marginLeft:'5px' }}>@ sju.ac.kr</p>
        </div>
        <p id="textAreaTip" style={{ margin: '0px 0px 10px 0px' }}>
          β» κ°μνμ  μΈμ’λ μ΄λ©μΌλ‘ μμ λΉλ°λ²νΈλ₯Ό λ°κΈν΄λλ¦½λλ€.<br/>λ‘κ·ΈμΈμ μλ£ν ν λ°λμ λΉλ°λ²νΈλ₯Ό λ³κ²½ν΄μ£ΌμΈμ.
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
              sendEmail();
            }}
          >
            ν μΈ
          </button>
        </div>
      </div>
    </div>
  );
};

export default PwSearchModal;
