import { useEffect } from "react";

const Facebook = () => {
  useEffect(() => {
    // SDK 載入完成時會立即呼叫 fbAsyncInit，在這個函式中對 Facebook SDK 進行初始化
    window.fbAsyncInit = function () {
      // 初始化 Facebook SDK
      window.FB.init({
        appId: "1104624167481682",
        cookie: true,
        xfbml: true,
        version: "v19.0",
      });

      console.log("[fbAsyncInit] after window.FB.init");

      // 取得使用者登入狀態
      window.FB.getLoginStatus(function (response) {
        console.log("[refreshLoginStatus]", response);
      });

      window.FB.AppEvents.logPageView();
    };

    // 載入 Facebook SDK
    (function (d, s, id) {
      var js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement(s);
      js.id = id;
      js.src = "https://connect.facebook.net/zh_TW/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    })(document, "script", "facebook-jssdk");
  }, []);

  const handleFBLogin = () => {
    // 跳出 Facebook 登入的對話框
    window.FB.login(
      function (response) {
        console.log("handleFBLogin", response);
      },
      { scope: "public_profile,email" }
    );
  };

  // ...
  return (
    <div>
      <button onClick={handleFBLogin}>Facebook Login</button>
    </div>
  );
};

export default Facebook;
