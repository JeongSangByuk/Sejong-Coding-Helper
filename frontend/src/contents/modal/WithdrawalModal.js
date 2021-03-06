import React, { useState } from 'react';
import ReactModal from 'react-modal';
import reactDom from 'react-dom';
import '../../css/modal/RoomAddingModal.css';
import { LOGIN_BEFORE } from '../../redux/login/loginTypes';
import { useHistory } from 'react-router';
import axios from 'axios';
import { API_BASE_URL } from '../utils/Constant';

const WithdrawalModal = ({ setModalOn }) => {
  const [nowPw, setNowPw] = useState('');
  const [nowPwCheck, setNowPwCheck] = useState('');
  const [checkString, setCheckString] = useState('');
  const history = useHistory();

  const withdrawMember = () => {
    if (nowPw === '' || checkString === '' || nowPwCheck === '') {
      alert('πββ μλ ₯μΉΈμ μ λΆ μλ ₯ν΄μ£ΌμΈμ. ββπ');
      return;
    }

    if (nowPwCheck !== nowPw) {
      alert('πββ λΉλ°λ²νΈκ° μΌμΉνμ§ μμ΅λλ€. ββπ');
      return;
    }

    if (checkString !== 'νμνν΄') {
      alert('πββ μ­μ  λ¬Έκ΅¬κ° μ¬λ°λ₯΄μ§ μμ΅λλ€. ββπ');
      return;
    }

    axios
      .post(
        API_BASE_URL + '/delete/user',
        { nowPwd: nowPw },
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
        alert('βββ μ±κ³΅μ μΌλ‘ νμ νν΄κ° μλ£λμ΅λλ€. βββ');
        
        history.push('/');
      })
      .catch((res) => {
        console.log(res);
      });
  };

  return (
    <div className="roomAddingmodal">
      <div className="bg" />
      <div className="roomAddingmodalBox">
        <p className="modalTitle">νμ νν΄</p>

        <div className="oneRow">
          <p style={{ width: '130px', marginTop: '12px' }}>λΉλ°λ²νΈ</p>
          <input
            style={{ width: '230px', fontFamily: 'none' }}
            type="password"
            onChange={(e) => {
              setNowPw(e.target.value);
            }}
          ></input>
        </div>

        <div className="oneRow">
          <p style={{ width: '130px', marginTop: '12px' }}>λΉλ°λ²νΈ νμΈ</p>
          <input
            style={{ width: '230px', fontFamily: 'none' }}
            type="password"
            onChange={(e) => {
              setNowPwCheck(e.target.value);
            }}
          ></input>
        </div>

        <div className="oneRow">
          <p
            style={{ width: '130px', marginTop: '12px', marginBottom: '20px' }}
          >
            μ­μ  λ¬Έκ΅¬ μλ ₯
          </p>
          <input
            style={{ width: '230px', marginBottom: '20px' }}
            placeholder="νμνν΄"
            onChange={(e) => {
              setCheckString(e.target.value);
            }}
          ></input>
        </div>
        <p id="textAreaTip" style={{ margin: '0px 0px 20px 0px' }}>
          β» μ λ§λ‘ νμ νν΄λ₯Ό μνμλ©΄ 'νμνν΄'λ₯Ό μλ ₯ν΄μ£ΌμΈμ.
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
              withdrawMember();
            }}
          >
            ν μΈ
          </button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalModal;
