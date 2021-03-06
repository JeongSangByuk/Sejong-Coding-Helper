import React, { useState, useEffect } from 'react';
import HorizontalHeader from './HorizontalHeader';
import VerticalHeader from './VerticalHeader';
import '../css/Signup.css';
import axios from 'axios';
import { API_BASE_URL } from './utils/Constant';
import { connect, useDispatch } from 'react-redux';
import { changeSignupAuth, changeSignupAuth2 } from '../redux/login/loginActions';
import { useLocation } from 'react-router';
import { changeLoadingState } from '../redux/view/viewActions';
import { isDOMComponent } from 'react-dom/test-utils';
import { useHistory } from 'react-router';

const SignupDetails = ({ signupAuth2, changeSignupAuth, changeSignupAuth2, changeLoadingState }) => {
  const location = useLocation();
  const history = useHistory();

  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [pwCheck, setPwCheck] = useState('');

  const email = location.state.email + '@sju.ac.kr';
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    return () => {
      changeSignupAuth(false);
    };
  }, [pathname]);

  const onClickSignupBnt = () => {
    if (id === '' || pw === '' || pwCheck === '' || name === '') {
      alert('πββ νμκ°μ μλ ₯μΉΈμ μ λΆ μλ ₯ν΄μ£ΌμΈμ. ββπ');
      return;
    }

    const reg_name = /^[κ°-ν£]{2,5}$/;
    const reg_pw = /^[a-z0-9_.*?[#?!@$%^&*-]{4,20}$/;
    const reg_stunum = /^[0-9]{8}$/;

    if (!reg_name.test(name)) {
      alert('πββ μ΄λ¦μ λ€μ νμΈν΄μ£ΌμΈμ. ββπ');
      return;
    }

    if (!reg_stunum.test(id)) {
      alert('πββ μμ΄λ(νλ²)λ₯Ό λ€μ νμΈν΄μ£ΌμΈμ. ββπ');
      return;
    }

    if (!reg_pw.test(pw)) {
      alert('πββ ν¨μ€μλλ 4κΈμ μ΄μμΌλ‘ μλ ₯ν΄μ£ΌμΈμ. ββπ');
      return;
    }

    if (pw !== pwCheck) {
      alert(
        'πββ ν¨μ€μλμ ν¨μ€μλ νμΈμ μλ ₯μ΄ μΌμΉνμ§ μμ΅λλ€. ββπ',
      );
      return;
    }

    changeLoadingState(true);

    // signup dbλ±λ‘ λ©μλ.
    axios
      .post(
        API_BASE_URL + '/completeUserSignup',
        { name: name, studentNumber: id, pwd: pw, email: email },
        {
          headers: {
            'Content-type': 'application/json',
            Accept: 'application/json',
          },
          withCredentials: true,
        },
      )
      .then((res) => {
        console.log(res.data)
        if (res.data === 'accepted') {

          // λλ²μ§Έ μΈμ¦ trueλ‘
          changeSignupAuth2(true);
          history.push({
            pathname: '/signupComplete',
            state: {
              name: name,
            },
          });


        } else {
          alert('μ΄λ―Έ κ°μλ νλ²μλλ€.');
        }
      })
      .catch((res) => {
        console.log(res);
        alert('μΌμμ  μ€λ₯κ° λ°μνμ΅λλ€. λ€μ μλν΄μ£ΌμΈμ.');
      })
      .finally(() => {
        changeLoadingState(false);
      });
  };

  return (
    <div id="signupMainContainer">
      <VerticalHeader />
      <HorizontalHeader />
      <div id="signupBox">
        <img src="img/logo.png" />
        <h3>Sejong Coding Helper νμκ°μ</h3>
        <div id="signupForm">
          <p className="smallTitle">μ΄λ¦</p>
          <input
            type="text"
            className="smallInput"
            maxLength="5"
            onChange={(e) => {
              setName(e.target.value);
            }}
          ></input>

          <p className="smallTitle">νλ²(μμ΄λ)</p>
          <p className="smallNotice">
            *μ±ν λ§€μΉ­μ μν΄μ μ νν νλ²μ μλ ₯ν΄μ£ΌμΈμ.
          </p>
          <input
            className="smallInput"
            maxLength="8"
            onChange={(e) => {
              setId(e.target.value);
            }}
            onKeyPress={(e) => {
              if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
              }
            }}
          ></input>

          <p className="smallTitle">λΉλ° λ²νΈ</p>
          <input
            className="smallInputPassword"
            maxLength="20"
            type="password"
            onChange={(e) => {
              setPw(e.target.value);
            }}
          ></input>

          <p className="smallTitle">λΉλ° λ²νΈ νμΈ</p>
          <input
            className="smallInputPassword"
            type="password"
            maxLength="20"
            onChange={(e) => {
              setPwCheck(e.target.value);
            }}
          ></input>

          <p className="smallTitle">μΈμ’λ μ΄λ©μΌ</p>
          <p className="smallNotice">*λΉλ°λ²νΈ λΆμ€μ μ΄μ©λ©λλ€.</p>
          <input className="smallInput" disabled value={email}></input>

          <button
            onClick={() => {
              onClickSignupBnt();
            }}
          >
            κ°μ μλ£
          </button>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = ({ login }) => {
  return {
    signupAuth: login.signupAuth,
    signupAuth2: login.signupAuth2,

  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    changeSignupAuth: (props) => dispatch(changeSignupAuth(props)),
    changeSignupAuth2: (props) => dispatch(changeSignupAuth2(props)),
    changeLoadingState: (props) => dispatch(changeLoadingState(props)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SignupDetails);
