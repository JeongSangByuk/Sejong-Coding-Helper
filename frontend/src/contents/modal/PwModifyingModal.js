import React, { useState } from 'react';
import ReactModal from 'react-modal';
import reactDom from 'react-dom';
import '../../css/modal/RoomAddingModal.css';
import { LOGIN_BEFORE } from '../../redux/login/loginTypes';
import axios from 'axios';
import { API_BASE_URL } from '../utils/Constant';

const PwModifyingModal = ({ setModalOn }) => {
  const [nowPw, setNowPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [newPwCheck, setNewPwCheck] = useState('');
  const reg_pw = /^[a-z0-9_.*?[#?!@$%^&*-]{4,20}$/;

  const modifyPw = () => {
    if (nowPw === '' || newPw === '' || newPwCheck === '') {
      alert('πββ μλ ₯μΉΈμ μ λΆ μλ ₯ν΄μ£ΌμΈμ. ββπ');
      return;
    }

    if (!reg_pw.test(newPw)) {
      alert('πββ ν¨μ€μλλ 4κΈμ μ΄μμΌλ‘ μλ ₯ν΄μ£ΌμΈμ. ββπ');
      return;
    }

    if (newPw !== newPwCheck) {
      alert('πββ μ λΉλ°λ²νΈκ° μΌμΉνμ§ μμ΅λλ€. ββπ');
      return;
    }

    axios
      .post(
        API_BASE_URL + '/update/pw',
        { nowPwd: nowPw, newPwd: newPw },
        {
          headers: {
            'Content-type': 'application/json',
            Accept: 'application/json',
          },
          withCredentials: true,
        },
      )
      .then((res) => {
        if (res.data === 'pwdError') {
          alert('πββ νμ¬ λΉλ°λ²νΈκ° μΌμΉνμ§ μμ΅λλ€. ββπ');
          return;
        }
        setModalOn(false);
        alert('βββ λΉλ°λ²νΈ λ³κ²½ μ±κ³΅ βββ');
      })
      .catch((res) => {
        console.log(res);
      });
  };

  return (
    <div className="roomAddingmodal">
      <div className="bg" />
      <div className="roomAddingmodalBox">
        <p className="modalTitle">λΉλ°λ²νΈ λ³κ²½</p>

        <div className="oneRow">
          <p style={{ width: '130px', marginTop: '12px' }}>νμ¬ λΉλ°λ²νΈ</p>
          <input
            style={{ width: '230px', fontFamily: 'none' }}
            type="password"
            onChange={(e) => {
              setNowPw(e.target.value);
            }}
          ></input>
        </div>

        <div className="oneRow">
          <p style={{ width: '130px', marginTop: '12px' }}>μ λΉλ°λ²νΈ</p>
          <input
            style={{ width: '230px', fontFamily: 'none' }}
            type="password"
            onChange={(e) => {
              setNewPw(e.target.value);
            }}
          ></input>
        </div>

        <div className="oneRow">
          <p style={{ width: '130px', marginTop: '12px' }}>μ λΉλ°λ²νΈ νμΈ</p>
          <input
            style={{ width: '230px', fontFamily: 'none' }}
            type="password"
            onChange={(e) => {
              setNewPwCheck(e.target.value);
            }}
          ></input>
        </div>

        <div className="cuttingLine" ></div>
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
              modifyPw();
            }}
          >
            ν μΈ
          </button>
        </div>
      </div>
    </div>
  );
};

export default PwModifyingModal;
