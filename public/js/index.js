var socket = io();

var $createChannel = $("#createChannel");
var $username = $("#username");
var userID,
  channel,
  joining = false;

function getTime() {
  var date = new Date();
  return date.getHours() + ":" + date.getSeconds();
}

function sendMessage() {
  socket.emit("newMessage", {
    id: channel.id,
    message: $("#new-message").val().trim(),
  });
  $("#new-message").val("").focus();
}

function showForm(channelData, success = true) {
  if (!success) {
    $("#channel-form").append(
      '<div class="alert alert-danger mt-3" role="alert">' +
        channelData +
        "</div >"
    );
    $createChannel.prop("disabled", true);
    setTimeout(function () {
      location.href = location.href.split("#")[0];
    }, 1000);
    return;
  }
  $("#channel-form").addClass("d-none");
  $("#chat-form").removeClass("d-none");
  userID = channelData.creatorID;
  if (joining) {
    userID = channelData.visitorID;
    $("#otherUser").html(channelData.creator);
  }
  location.href = "#channel=" + channelData.id;
  channel = channelData;
  $("#new-message").focus();

  $("#send-message").on("click", sendMessage);
  $(document).on("keypress", function (e) {
    if (e.which == 13) {
      sendMessage();
    }
  });
}

$(window).bind("beforeunload", function () {
  if (channel) {
    socket.emit("leaveChannel", channel.id);
  }
});

document.addEventListener("DOMContentLoaded", function () {
  var lastUsername = localStorage.getItem("lastUsername");
  if (lastUsername) {
    username.value = lastUsername;
  } else {
    username.value = "User " + Math.floor(Math.random() * 1000);
  }
  username.focus();

  if (location.hash) {
    joining = true;
    $createChannel.html("Join channel");
    $createChannel.on("click", function (e) {
      socket.emit(
        "joinChannel",
        {
          username: username.value,
          channelID: location.hash.replace("#channel=", ""),
        },
        showForm
      );
    });
  } else {
    $createChannel.on("click", function (e) {
      socket.emit("createChannel", { username: username.value }, showForm);
    });
  }

  socket.on("broadcastMessage", function (data) {
    if (data.userID === userID) {
      $(".msg_container_base").append(`
                <div class="msg_container base_sent">
                    <div class="messages msg_sent">
                        <p>${data.message}</p>
                        <time datetime="${Date.now()}">${getTime()}</time>
                    </div>
                </div>
            `);
    } else {
      $(".msg_container_base").append(`
                <div class="msg_container base_receive">
                    <div class="messages msg_receive">
                        <p>${data.message}</p>
                        <time datetime="${Date.now()}">${getTime()}</time>
                    </div>
                </div>
            `);
    }
  });

  socket.on("userJoined", function (otherUser) {
    $("#otherUser").html(otherUser);
  });

  socket.on("userLeft", function () {
    $("#otherUser").html($("#otherUser").html() + " Left..");
  });
});
