
Session.set('userList-filter', {})

Template.userlist.helpers({
    listOfUsers: function(){
        return Meteor.users.find(Session.get('userList-filter'))
    }
})

Template.userlist.events({
    'keyup .userList-filter': function(e){
        var value = $(e.target).val().trim().toLowerCase()

        if(value) {
            Meteor.subscribe('userList', value)
            Session.set('userList-filter', {username: {$regex: value}})
        } else {
            Session.set('userList-filter', {})
        }
    },
})