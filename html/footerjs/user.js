
var config = {
  cid: "dafb27cb88db35267e75",
  yqluri: "store://gdDAnJkTXAuVgzAQ8wboA2"
};

var AuthProvider = require("auth-provider");

AuthProvider.init({
  github:{
    client_id: config.cid,
    access_retriever:yql_access(config.yqluri)
  }
});

window.user = new AuthProvider();
user.on("error",function(e){
  console.error(e);
});
user.on("login",function(token){
  jQuery(".four-zero-three .content").text("You've authenticated!");
});
