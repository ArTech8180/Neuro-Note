import {

    auth,
    provider,
    db,

    signInWithPopup,
    signOut,
    onAuthStateChanged,

    doc,
    setDoc,
    getDoc

}
from "./firebase.js";

/* =====================================================
   GOOGLE LOGIN
===================================================== */

async function loginWithGoogle(){

    try{

        const result =
        await signInWithPopup(
            auth,
            provider
        );

        showToast(
            "Welcome " +
            result.user.displayName
        );

    }

    catch(error){

        console.error(
            error
        );

        showToast(
            "Login failed"
        );

    }

}

window.loginWithGoogle =
loginWithGoogle;

/* =====================================================
   LOGOUT
===================================================== */

async function handleLogout(){

    try{

        await signOut(
            auth
        );

        showToast(
            "Logged out"
        );

    }

    catch(error){

        console.error(
            error
        );

    }

}

window.handleLogout =
handleLogout;

/* =====================================================
   SAVE BOOKS
===================================================== */

window.saveBooksToCloud =
async function(){

    const user =
    auth.currentUser;

    if(!user) return;

    try{

        const syncStatus =
        document.getElementById(
            "syncStatus"
        );

        if(syncStatus){

            syncStatus.textContent =
            "Syncing...";
        }

        await setDoc(

            doc(
                db,
                "users",
                user.uid
            ),

            {

                books:
                window.books || []

            }

        );

        if(syncStatus){

            syncStatus.textContent =
            "Synced ✓";
        }

        console.log(
            "Books saved successfully"
        );

    }

    catch(error){

        console.error(
            error
        );

    }

};

/* =====================================================
   LOAD BOOKS
===================================================== */

window.loadBooksFromCloud =
async function(){

    const user =
    auth.currentUser;

    if(!user) return;

    try{

        const snapshot =
        await getDoc(

            doc(
                db,
                "users",
                user.uid
            )

        );

        if(
            snapshot.exists()
        ){

            books =
            snapshot.data().books || [];
            window.books =
            books;
            if(
                typeof saveData ===
                "function"
            ){

                saveData();

            }

            if(
                typeof renderBooks ===
                "function"
            ){

                renderBooks();

            }

            console.log(
                "Books loaded"
            );

        }

        else{

            console.log(
                "No cloud books found"
            );

        }

    }

    catch(error){

        console.error(
            error
        );

    }

};

/* =====================================================
   AUTH STATE LISTENER
===================================================== */

onAuthStateChanged(

    auth,

    async (user) => {

        const loginBtn =
        document.getElementById(
            "loginBtn"
        );

        const profileWidget =
        document.getElementById(
            "profileWidget"
        );

        if(user){

            if(loginBtn){

                loginBtn.style.display =
                "none";

            }

            if(profileWidget){

                profileWidget.style.display =
                "flex";

            }

            const userAvatar =
            document.getElementById(
                "userAvatar"
            );

            const userAvatarMenu =
            document.getElementById(
                "userAvatarMenu"
            );

            const userName =
            document.getElementById(
                "userName"
            );

            const userEmail =
            document.getElementById(
                "userEmail"
            );

            if(userAvatar){

                userAvatar.src =
                user.photoURL;

            }

            if(userAvatarMenu){

                userAvatarMenu.src =
                user.photoURL;

            }

            if(userName){

                userName.textContent =
                user.displayName;

            }

            if(userEmail){

                userEmail.textContent =
                user.email;

            }

            await window.loadBooksFromCloud();

        }

        else{

            if(loginBtn){

                loginBtn.style.display =
                "flex";

            }

            if(profileWidget){

                profileWidget.style.display =
                "none";

            }

        }

    }

);