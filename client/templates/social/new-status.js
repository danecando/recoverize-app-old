Template.newStatus.created = function() {
    this.charsLeft = new ReactiveVar(255);
};

Template.newStatus.rendered = function() {
    var chars = $('#newStatus').val().length;
    $('#charsLeft').css({ color: 'rgb(' + chars + ',20,20)' });
    this.charsLeft.set(255 - chars);
};

Template.newStatus.destroyed = function() {

    // reset global props
    Props.statusReply = null;
};

Template.newStatus.helpers({
    replyData: function() {
        var reply = Props.statusReply;

        if (reply) {
            return reply;
        } else {
            return false;
        }
    },
    charsLeft: function() {
        return Template.instance().charsLeft.get();
    },
    status: function() {
        return Status.find({username: Meteor.user().username}, {sort: {timestamp: -1}, limit: 1});
    }
});

Template.newStatus.events({
    'keypress #newStatus': function(e, template) {
        var status = e.target.value;
        if(e.which == 13 && isValidStatus(status)){
            e.preventDefault();
            submitStatus(e, template);
        }
    },
    'submit .share-form form': function(e, template) {
        e.preventDefault();
        submitStatus(e, template);
    },
    'change #newStatus, keypress #newStatus, keyup #newStatus, keydown #newStatus': function(e, template) {
        var chars = $(e.target).val().length;
        $('#charsLeft').css({ color: 'rgb(' + chars + ',20,20)' });
        template.charsLeft.set(255 - chars);
    },
    'click #getImage': function(e, template) {
        e.preventDefault();
        if (Meteor.isCordova) {
            navigator.camera.getPicture(function(imageUri) {
                var fileNameIndex = imageUri.lastIndexOf("/") + 1;
                var filename = imageUri.substr(fileNameIndex);

                window.resolveLocalFileSystemURL(imageUri, function(fileEntry) {
                    fileEntry.file(function(file) {
                        file.name = filename;
                        template.cordovaFile = file;
                    });
                });

                $('.add-image').fadeOut(100, function() {
                    $('.remove-image').fadeIn(100);
                    $('.file-name').text(filename);
                });

            }, function(err) {
                console.log(err);
            }, { quality: 50,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType : Camera.PictureSourceType.PHOTOLIBRARY
            });
        } else {
            $('#statusImage').focus().trigger('click');
        }
    },
    'change #statusImage': function(e, template) {
        $('.add-image').fadeOut(100, function() {
            $('.remove-image').fadeIn(100);
            $('.file-name').text(e.target.value.replace(/^.*[\\\/]/, ''));
        });
    },
    'click #removeImage': function(e, template) {
        e.preventDefault();
        $('#statusImage').val('');
        $('.remove-image').fadeOut(100, function() {
            $('.add-image').fadeIn(100);
        });
    }
});

function isValidStatus(str) {
    return str.trim() !== '' && str.length < 255;
}

function submitStatus(e, template) {
    var share = {};
    share.status = $('#newStatus').val();
    share.image = template.$('#statusImage')[0].files[0] || null;

    if(isValidStatus(share.status) || share.image || template.cordovaFile) {

        $('#shareStatus').text('Sharing...');

        if (!Meteor.isCordova && share.image) {

            Utility.statusPhotoUpload(share.image, function(error, result) {
                if (error) {
                    $('.share-input').css('border-color', 'red');
                    $('.response').text(error);
                    $('#shareStatus').text('Share');
                    return;
                }

                share.image = Meteor.user().username + '/' + share.image.name;

                Meteor.call('createStatus', share, function(error, result) {
                    $('#newStatus, #statusImage').val('');
                    $("#page").animate({ scrollTop: $(document).height() }, 200);
                    $('.remove-image').fadeOut(100, function() {
                        $('.add-image').fadeIn(100);
                    });
                    $('#shareStatus').text('Shared!');
                });
            });

        } else if (Meteor.isCordova && template.cordovaFile) {

            var file = template.cordovaFile;
            var reader = new FileReader();
            reader.onloadend = function(e) {
                var fileBlob = Utility.dataURItoBlob(e.target.result);
                if (fileBlob) {
                    fileBlob.name = file.name;
                    Utility.statusPhotoUpload(fileBlob, function(error, result) {
                        if (error) {
                            $('.share-input').css('border-color', 'red');
                            $('.response').text(error);
                            $('#shareStatus').text('Share');
                            return;
                        }

                        share.image = Meteor.user().username + '/' + file.name;

                        Meteor.call('createStatus', share, function(error, result) {
                            $('#newStatus, #statusImage').val('');
                            $('#page').animate({ scrollTop: $(document).height() }, 200);
                            $('.remove-image').fadeOut(100, function() {
                                $('.add-image').fadeIn(100);
                            });
                            $('#shareStatus').text('Shared!');
                        });
                    });
                }
            }
            reader.readAsDataURL(file);


        } else {
            Meteor.call('createStatus', share, function(error, result) {
                $('#newStatus, #statusImage').val('');
                $("#page").animate({ scrollTop: $(document).height() }, 200);
                $('.remove-image').fadeOut(100, function() {
                    $('.add-image').fadeIn(100);
                });
                $('#shareStatus').text('Shared!');
            });
        }
    }
}