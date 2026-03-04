const users =[];

//Add a user to the list

const addUser = ({name , userId , roomId, host, presenter, socketId}) => {
    const user = {name , userId , roomId, host, presenter, socketId};
    users.push(user);
    return user; 
}

//Remove the user from the list
const removeUser = (id) => {
    const index = users.findIndex((user) => user.socketId === id);
    console.log(index);
    if(index !== -1){
        return users.splice(index, 1)[0];
    }
}

//Get the user from the list
const getUser = (id) => {
    return users.find((user) => user.socketId === id);
}

//Get all users from the room
const getUsersInRoom = (roomId) => {
    return users.filter((user) => user.roomId === roomId);
}

module.exports = {
    addUser, 
    removeUser, 
    getUser, 
    getUsersInRoom};