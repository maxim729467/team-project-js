import firebase from 'firebase/app';
import 'firebase/auth';
// import 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyC5XShaL3vp3Iinx35hfO3S-EImalXSgec',
  authDomain: 'filmoteka-22c14.firebaseapp.com',
  projectId: 'filmoteka-22c14',
  storageBucket: 'filmoteka-22c14.appspot.com',
  messagingSenderId: '870533390135',
  appId: '1:870533390135:web:cf3bd9ac90b024898544b2',
};

firebase.initializeApp(firebaseConfig);

////////////////

let timerId, timerId2;

// Auth Refs

const authContainerRef = document.querySelector('[data-action="auth-backdrop"]');
const authOpenButtonRef = document.querySelector('[data-action="auth-open"]');
const authCloseButtonRef = document.querySelector('[data-action="auth-close"]');

const authNotifyField = document.querySelector('[data-action="auth-notify"]');

const passwordEyeIconRefs = document.querySelectorAll('[data-action="toggle-password"]');
const passResetBtnRef = document.querySelector('[data-action="password-reset"]');
const verifiedIconRef = document.querySelector('[data-action="verify-email"]');

const authLoginButtonRef = document.querySelector('[data-action="log-button"]');
const authSignupButtonRef = document.querySelector('[data-action="sign-button"]');

// Auth Listeners

const AddAuthListeners = () => {
  authLoginButtonRef.addEventListener('click', handleLogIn);
  authSignupButtonRef.addEventListener('click', handleSignUp);

  passResetBtnRef.addEventListener('click', sendPasswordReset);
  passResetBtnRef.addEventListener('mouseenter', showPasswordResetHint);
  passResetBtnRef.addEventListener('mouseleave', hidePasswordResetHint);

  verifiedIconRef.addEventListener('click', sendEmailVerification);
  verifiedIconRef.addEventListener('mouseenter', showVerificationEmailHint);
  verifiedIconRef.addEventListener('mouseleave', hideVerificationEmailtHint);

  passwordEyeIconRefs.forEach(icon => {
    icon.addEventListener('click', togglePasswordDisplay);
    icon.addEventListener('mouseenter', showPasswordDisplayHint);
    icon.addEventListener('mouseleave', authClearOutput);
  });

  document.addEventListener('keydown', onEscKeyPressed);
  authContainerRef.addEventListener('click', onAuthBackdropClicked);
};

const openAuthModal = () => {
  authContainerRef.classList.remove('auth-hidden');
  document.body.classList.add('auth-modal-open', 'body-overflow');
  AddAuthListeners();
};

const closeAuthModal = () => {
  authContainerRef.classList.add('auth-hidden');
  document.body.classList.remove('auth-modal-open', 'body-overflow');
  RemoveAuthListeners();
};

const RemoveAuthListeners = () => {
  authLoginButtonRef.removeEventListener('click', handleLogIn);
  authSignupButtonRef.removeEventListener('click', handleSignUp);
  passResetBtnRef.removeEventListener('click', sendPasswordReset);

  verifiedIconRef.removeEventListener('click', sendEmailVerification);
  verifiedIconRef.removeEventListener('mouseenter', showVerificationEmailHint);
  verifiedIconRef.removeEventListener('mouseleave', hideVerificationEmailtHint);

  passwordEyeIconRefs.forEach(icon => {
    icon.removeEventListener('click', togglePasswordDisplay);
    icon.removeEventListener('mouseenter', showPasswordDisplayHint);
    icon.removeEventListener('mouseleave', authClearOutput);
  });

  passResetBtnRef.removeEventListener('mouseenter', showPasswordResetHint);
  passResetBtnRef.removeEventListener('mouseleave', hidePasswordResetHint);

  document.removeEventListener('keydown', onEscKeyPressed);
  authContainerRef.removeEventListener('click', onAuthBackdropClicked);
};

const togglePasswordDisplay = evt => {
  const target = evt.target.closest('.form-field').querySelector('[data-action="input-password"]');

  if (!target.value) return;

  if (target.type === 'password') {
    target.type = 'text';
    setTimeout(() => {
      target.type = 'password';
    }, 1000);
  } else {
    target.type = 'password';
  }
};

const showPasswordDisplayHint = evt => {
  const target = evt.target.closest('.form-field').querySelector('[data-action="input-password"]');

  if (!target.value) return;

  authNotify('show/hide password', 'note');
};

const showPasswordResetHint = () => {
  timerId2 = setTimeout(() => authNotify('Send password reset Email?', 'note'), 1000);
};

const hidePasswordResetHint = () => {
  clearTimeout(timerId2);

  if (authNotifyField.textContent === 'Password reset Email sent!') return;
  authClearOutput();
};

const showVerificationEmailHint = () => {
  if (firebase.auth().currentUser.emailVerified) {
    authNotify('Your Email is verified!', 'success');
    return;
  }

  timerId2 = setTimeout(
    () => authNotify('Your Email is not verified. Send verification request?', 'alert'),
    500,
  );
};

const hideVerificationEmailtHint = () => {
  clearTimeout(timerId2);

  if (authNotifyField.textContent === 'Verification Email sent!') return;
  authClearOutput();
};

const onEscKeyPressed = evt => {
  if (evt.code !== 'Escape') return;

  closeAuthModal();
};

const onAuthBackdropClicked = evt => {
  if (evt.target.closest('.auth-popup')) return;

  closeAuthModal();
};

authOpenButtonRef.addEventListener('click', openAuthModal);
authCloseButtonRef.addEventListener('click', closeAuthModal);

// Auth notification

const authNotify = (message, type = 'alert') => {
  authClearOutput();

  authNotifyField.classList.add(type);
  authNotifyField.textContent = message;
  authNotifyField.classList.add('animate');

  setTimeout(() => authNotifyField.classList.remove('animate'), 1000);
  timerId = setTimeout(() => authClearOutput(), 8000);
};

const authClearOutput = () => {
  clearTimeout(timerId);
  authNotifyField.textContent = '\u00A0';
  authNotifyField.classList.remove('alert', 'success', 'note', 'animate');
};

// Auth main logic
////////////////////////////////////////////////////////////////////////

// Handles the sign in button press.

function handleLogIn(evt) {
  evt.preventDefault();
  clearsignUp();

  if (firebase.auth().currentUser) {
    firebase
      .auth()
      .signOut()
      .then(() => authNotify('You have signed out succesfully', 'success'));
  } else {
    const email = document.querySelector('#logemail').value;
    const password = document.querySelector('#logpass').value;

    if (email.length < 4) {
      authNotify('Please enter an email address.');
      return;
    }
    if (password.length < 4) {
      authNotify('Please enter a longer password.');
      return;
    }
    // Sign in with email and pass.
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(({ user }) => authNotify(`Signed to ${user.displayName || 'anonymous'}`, 'success'))
      .catch(function (error) {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;

        if (errorCode === 'auth/wrong-password') {
          authNotify('Wrong password.');
        } else {
          authNotify(errorMessage);
        }
      });
  }
}

// Handles the sign up button press.

function handleSignUp(evt) {
  evt.preventDefault();
  clearLogin();

  const email = document.querySelector('#signemail').value;
  const password = document.querySelector('#signpass').value;
  const userName = document.querySelector('#signname').value;

  if (email.length < 4) {
    authNotify('Please enter an email address.');
    return;
  }
  if (password.length < 4) {
    authNotify('Please enter a longer password.');
    return;
  }
  // Create user with email and pass.
  firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then(({ user }) => {
      return user.updateProfile({
        displayName: userName,
        photoURL: null,
      });
    })
    .then(() => {
      authNotify(`${userName}, wellcome to our Filmoteka!`, 'success');
      document.querySelector('#sign-in-text').textContent = 'Signed to: ';
      document.querySelector('#logged-user').textContent = userName;
      authLoginButtonRef.textContent = 'Sign out';
    })
    .catch(function (error) {
      const errorCode = error.code;
      const errorMessage = error.message;

      if (errorCode == 'auth/weak-password') {
        authNotify('The password is too weak.');
      } else {
        authNotify(errorMessage);
      }
    });
}

// Sends an email verification to the user.

function sendEmailVerification() {
  if (firebase.auth().currentUser.emailVerified) return;

  firebase
    .auth()
    .currentUser.sendEmailVerification()
    .then(function () {
      // Email Verification sent!
      authNotify('Verification Email sent!', 'success');
    });
}

function sendPasswordReset() {
  const email = document.querySelector('#logemail').value;

  firebase
    .auth()
    .sendPasswordResetEmail(email)
    .then(function () {
      // Password Reset Email Sent!
      authNotify('Password reset Email sent!', 'success');
    })
    .catch(function (error) {
      const errorCode = error.code;
      const errorMessage = error.message;

      if (errorCode == 'auth/invalid-email') {
        authNotify(errorMessage);
      } else if (errorCode == 'auth/user-not-found') {
        authNotify(errorMessage);
      }
    });
}

const clearLogin = () => {
  document.querySelector('#logemail').value = '';
  document.querySelector('#logpass').value = '';
};

const clearsignUp = () => {
  document.querySelector('#signemail').value = '';
  document.querySelector('#signpass').value = '';
  document.querySelector('#signname').value = '';
};

/**
 * initApp handles registering Firebase auth listeners:
 *  - firebase.auth().onAuthStateChanged: This listener is called when the user is signed in or
 *    out, and that is where we update the UI.
 */
function initApp() {
  //   // Listening for auth state changes.
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      //       // User is signed in.
      const { displayName, email, emailVerified, photoURL, isAnonymous, uid, providerData } = user;

      document.querySelector('#sign-in-text').textContent = 'Signed to: ';
      document.querySelector('#logged-user').textContent = displayName || 'anonymous';
      authLoginButtonRef.textContent = 'Sign out';

      document.body.classList.add('logged-in');
      document.body.dataset.user = displayName || 'anonymous';
      document.body.dataset.verified = emailVerified;
    } else {
      //       // User is signed out.
      document.querySelector('#sign-in-text').textContent = 'Sign in';
      document.querySelector('#logged-user').textContent = '';
      authLoginButtonRef.textContent = 'Sign in';

      document.body.classList.remove('logged-in');
      document.body.removeAttribute('data-user');
      document.body.removeAttribute('data-verified');
    }
  });
}

window.onload = function () {
  initApp();
};
