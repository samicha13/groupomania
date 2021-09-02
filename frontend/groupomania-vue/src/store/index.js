import { createStore } from 'vuex'

import instance from "../Api.js"

let user = localStorage.getItem('user');
if (!user) {
    user = {
        userId: -1,
        token: '',
    };
} else {
    try {
        user = JSON.parse(user);
        instance.defaults.headers.common['Authorization'] = user.token;
    } catch (ex) {
        user = {
            userId: -1,
            token: '',
        };
    }
}

// Create a new store instance.
const store = createStore({
    state: {
        status: '',
        user: user,
        userInfos: {
            nom: '',
            prenom: '',
            email: '',
            photo: '',
        },
    },
    mutations: {
        setStatus: function (state, status) {
            state.status = status;
        },
        logUser: function (state, user) {
            instance.defaults.headers.common['Authorization'] = user.token;
            localStorage.setItem('user', JSON.stringify(user));
            state.user = user;
        },
        userInfos: function (state, userInfos) {
            state.userInfos = userInfos;
        },
        logout: function (state) {
            state.user = {
                userId: -1,
                token: '',
            }
            localStorage.removeItem('user');
        }
    },
    actions: {
        login: ({ commit }, userInfos) => {
            commit('setStatus', 'loading');
            return new Promise((resolve, reject) => {
                instance.post('/auth/login', userInfos)
                    .then(function (response) {
                        commit('setStatus', '');
                        commit('logUser', response.data);
                        localStorage.setItem('token', response.data.token)
                        resolve(response);
                    })
                    .catch(function (error) {
                        commit('setStatus', 'error_login');
                        reject(error);
                    });
            });
        },
        createAccount: ({ commit }, userInfos) => {
            commit('setStatus', 'loading');
            return new Promise((resolve, reject) => {
                commit;
                instance.post('/auth/signup', userInfos)
                    .then(function (response) {
                        commit('setStatus', 'created');
                        resolve(response);
                    })
                    .catch(function (error) {
                        commit('setStatus', 'error_create');
                        reject(error);
                    });
            });
        },
        getUserInfos: ({ state, commit }, userId) => {
            instance({
                method: 'GET',
                url: '/auth/' + userId,
                headers: { 'Authorization': 'Bearer ' + state.user.token }
            })
                .then(function (response) {
                    commit('userInfos', response.data);
                })
                .catch(function () {
                });
        },
        createPost: ({ state }, formData) => {
            instance.post('/posts/', formData,
                { headers: { 'Authorization': 'Bearer ' + state.user.token } }
            )
                .then(function () {
                    alert("Votre post a bien été creé !");
                    document.location.reload();
                    //this.$router.push("/forum");
                })
                .catch((error) => {
                    this.error = error.response.data;
                });
        },
        deleteUser({ state }) {
            const userId = state.user.userId;
            instance({
                method: 'DELETE',
                url: '/auth/' + userId,
                data: {
                    email: state.user.email,
                    password: state.user.password
                }
            })
                .then(response => {
                    console.log(response);
                   this.commit("logout")
                       
                })
                .catch(error => {
                    alert("Une erreur est survenue. Veuillez vérifiez que votre mot de passe est correct.");
                    console.log(error);
                });
        },
        
        
    }
});


export default store;