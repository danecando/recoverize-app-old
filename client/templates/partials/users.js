
Template.usersp.helpers({
    profile: function() {
        console.log(!!this.profile);
    }
});

Template.usersp.events({
    'click .followBtn': function() {
        Meteor.call('follow', this.username);
    },
    'click .unfollowBtn': function() {
        Meteor.call('unfollow', this.username);
    }
});