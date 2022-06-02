const config = {
  initialPage: document.getElementById("initialPage"),
  mainPage: document.getElementById("mainPage"),
};

class User {
  constructor(name, years, days, money, items, incomePerClick) {
    this.name = name;
    this.years = years;
    this.days = days;
    this.money = money;
    this.clickCount = 0;
    this.incomePerClick = incomePerClick ? incomePerClick : 100;
    this.incomePerSec = 0;
    this.items = items;
  }
}

class Items {
  constructor(
    name,
    type,
    currentAmount,
    maxAmount,
    perMoney,
    perRate,
    price,
    url
  ) {
    this.name = name;
    this.type = type;
    this.currentAmount = currentAmount;
    this.maxAmount = maxAmount;
    this.perMoney = perMoney;
    this.perRate = perRate;
    this.price = price;
    this.url = url;
  }
}

class View {
  static createInitialPage() {
    let container = document.createElement("div");
    container.classList.add(
      "vh-100",
      "d-flex",
      "justify-content-center",
      "align-items-center"
    );
    container.innerHTML = `
        <div class="bg-white text-center p-5">
            <h2 class="pb-3">漫才クリックゲーム</h2>
            <p class="pb-2">漫才師になって一攫千金を目指そう！</p>
            <form>
                <div class="form-row pb-3">
                    <div class="col">
                        <input type="text" class="form-control" placeholder="名前">
                    </div>
                </div>
            </form>
            <div class="d-flex justify-content-between">
                <div class="col-6 pl-0">
                    <button type="submit" class="btn btn-primary col-12" id="newGame">新規ゲーム</button>
                </div>
                <div class="col-6 pl-0">
                    <button type="submit" class="btn btn-primary col-12" id="login">ログイン</button>
                </div>
            </div>
        </div>
    `;

    return config.initialPage.append(container);
  }

  static createMainPage(user) {
    let container = document.createElement("div");
    container.innerHTML = `
      <div class="d-flex justify-content-center p-md-5 pb-5 vh-100">
        <div class="bg-navy p-2 d-flex col-md-11 col-lg-10 pb-5">
            <div class="bg-dark p-2 col-4" id="manzaiStatus">
            </div>
            <div class="col-8">
                <div class="p-1 bg-navy" id="userInfo">
                </div>
                <div class="bg-dark mt-2 p-1 overflow-auto flowHeight" id="displayItems"></div>
                <div class="d-flex justify-content-end mt-2">
                    <div class="border p-2 mr-2 hover" id="reset">
                         <i class="fas fa-undo fa-2x text-white"></i>
                    </div>
                    <div class="border p-2 hover" id="save">
                         <i class="fas fa-save fa-2x text-white"></i>
                    </div>
                </div>
            </div>
        </div>
      </div>
      `;

    container
      .querySelectorAll("#manzaiStatus")[0]
      .append(View.createManzaiStatus(user));
    container
      .querySelectorAll("#userInfo")[0]
      .append(View.createUserInfo(user));
    container
      .querySelectorAll("#displayItems")[0]
      .append(View.createItemPage(user));

    let resetBtn = container.querySelectorAll("#reset")[0];
    resetBtn.addEventListener("click", function () {
      Controller.resetAllData(user);
    });

    let saveBtn = container.querySelectorAll("#save")[0];
    saveBtn.addEventListener("click", function () {
      Controller.saveUserData(user);
      Controller.stopTimer();
      Controller.initializePage();
    });

    return config.mainPage.append(container);
  }

  static createManzaiStatus(user) {
    let container = document.createElement("div");
    container.innerHTML = `
        <div class="bg-navy text-white text-center">
            <h5>${user.clickCount} 公演</h5>
            <p>1クリック ¥${user.incomePerClick}</p>
        </div>
        <div class="p-2 pt-5 d-flex justify-content-center" id="clickerWrapper">
            <img src="/assets/images/manzai.png" width=80% class="py-2 hover img-fluid clickable" id="manzai">
        </div>
    `;
    let click = container.querySelectorAll("#manzai")[0];
    click.addEventListener("click", function () {
      Controller.updateByClick(user);
    });
    return container;
  }

  static createUserInfo(user) {
    let container = document.createElement("div");
    container.classList.add("d-flex", "flex-wrap", "p-1");
    container.innerHTML = `
        <div class="text-white text-center col-12 col-sm-6 userInfoBorder">
            <p>${user.name}</p>
        </div>
        <div class="text-white text-center col-12 col-sm-6 userInfoBorder">
            <p>芸歴:${user.years}年目</p>
        </div>
        <div class="text-white text-center col-12 col-sm-6 userInfoBorder">
            <p>${user.days} days</p>
        </div>
        <div class="text-white text-center col-12 col-sm-6 userInfoBorder">
            <p>¥${user.money}</p>
        </div>
    `;
    return container;
  }

  static createItemPage(user) {
    let container = document.createElement("div");
    for (let i = 0; i < user.items.length; i++) {
      container.innerHTML += `
        <div class="text-white d-sm-flex align-items-center m-1 selectItem">
            <div class="d-none d-sm-block p-1 col-sm-3">
                <img src="${user.items[i].url}" class="img-fluid">
            </div>
            <div class="col-sm-9">
                <div class="d-flex justify-content-between">
                    <h4>${user.items[i].name}</h4>
                    <h4>${user.items[i].currentAmount}</h4>
                </div>
                <div class="d-flex justify-content-between">
                    <p>¥${user.items[i].price}</p>
                    <p class="text-success">￥${View.displayItemIncome(
                      user.items[i],
                      user.items[i].type
                    )}</p>
                </div>
            </div>
        </div>
    `;
    }

    let select = container.querySelectorAll(".selectItem");
    for (let i = 0; i < select.length; i++) {
      select[i].addEventListener("click", function () {
        config.mainPage.querySelectorAll("#displayItems")[0].innerHTML = "";
        config.mainPage
          .querySelectorAll("#displayItems")[0]
          .append(View.createPurchasePage(user, i));
      });
    }

    return container;
  }

  static createPurchasePage(user, index) {
    let container = document.createElement("div");
    container.innerHTML = `
      <div class="bg-navy p-2 m-1 text-white">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h4>${user.items[index].name}</h4>
            <p>最大追加可能数: ${View.displayMaxPurchase(
              user.items[index].maxAmount
            )}</p>
            <p>料金: ￥${user.items[index].price}</p>
            <p>効果: ￥${View.displayItemIncome(
              user.items[index],
              user.items[index].type
            )}</p>
          </div>
          <div class="p-2 d-sm-block col-sm-5">
            <img src="${user.items[index].url}" alt="" class="img-fluid">
          </div>
        </div>
        <p>いくつ追加しますか？</p>
          <input type="number" placeholder="0" class="col-12 form-control" />
          <p class="text-right" id="totalPrice">合計: ¥0</p>
          <div class="d-flex justify-content-between pb-3">
            <button class="btn btn-outline-primary col-5 bg-light" id="back">戻る</button>
            <button class="btn btn-primary col-5 bg-right" id="purchase">購入する</button>
          </div>
      </div>
    `;

    let inputCount = container.querySelectorAll("input")[0];
    inputCount.addEventListener("input", function () {
      container.querySelectorAll("#totalPrice")[0].innerHTML = `
        合計: ¥${Controller.getTotalPrice(user.items[index], inputCount.value)}
      `;
    });

    let backBtn = container.querySelectorAll("#back")[0];
    backBtn.addEventListener("click", function () {
      View.updateMainPage(user);
    });

    let purchaseBtn = container.querySelectorAll("#purchase")[0];
    purchaseBtn.addEventListener("click", function () {
      Controller.purchaseItems(user, index, inputCount.value);
      View.updateMainPage(user);
    });

    return container;
  }

  static displayMaxPurchase(maxAmount) {
    if (maxAmount === -1) return "∞";
    else return maxAmount;
  }

  static displayItemIncome(item, type) {
    if (type === "ability") return item.perMoney + "/クリック";
    else if (type === "authority") return item.perRate + " /秒";
    else return item.perMoney + " /秒";
  }

  static updateMainPage(user) {
    config.mainPage.innerHTML = "";
    config.mainPage.append(View.createMainPage(user));
  }

  static updateManzaiPage(user) {
    let manzaiStatus = config.mainPage.querySelectorAll("#manzaiStatus")[0];
    manzaiStatus.innerHTML = "";
    manzaiStatus.append(View.createManzaiStatus(user));
  }

  static updateUserInfo(user) {
    let userInfo = config.mainPage.querySelectorAll("#userInfo")[0];
    userInfo.innerHTML = "";
    userInfo.append(View.createUserInfo(user));
  }
}

class Controller {
  timer;
  static startGame() {
    View.createInitialPage();

    let newGameBtn = config.initialPage.querySelectorAll("#newGame")[0];
    newGameBtn.addEventListener("click", function () {
      let userName = config.initialPage.querySelectorAll("input")[0].value;
      if (userName === "") {
        alert("名前を入力してください");
      } else {
        let user = Controller.createInitialUserAccount(userName);
        Controller.moveInitialToMain(user);
      }
    });

    let loginBtn = config.initialPage.querySelectorAll("#login")[0];
    loginBtn.addEventListener("click", function () {
      let userName = config.initialPage.querySelectorAll("input")[0].value;
      if (userName === "") {
        alert("名前を入力してください");
      } else {
        let user = Controller.getUserData(userName);
        if (user === null) alert("データがありません。");
        else Controller.moveInitialToMain(user);
      }
    });
  }

  static moveInitialToMain(user) {
    config.initialPage.classList.add("d-none");
    config.mainPage.append(View.createMainPage(user));
    Controller.startTimer(user);
  }

  static createInitialUserAccount(userName) {
    /* TODO
    アイテムの追加
    Items("名前", "タイプ", 所持数, 最大購入可能数, クリックごとに得られるお金, 秒ごとに得られるお金, 値段, 画像URL)
    */
    let itemsList = [
      new Items(
        "漫才秘伝の書（初級）",
        "ability",
        0,
        500,
        25,
        0,
        15000,
        "/assets/images/makimono.png"
      ),
      new Items(
        "漫才秘伝の書（中級）",
        "ability",
        0,
        250,
        100,
        0,
        50000,
        "/assets/images/makimono.png"
      ),
      new Items(
        "漫才秘伝の書（上級）",
        "ability",
        0,
        100,
        250,
        0,
        100000,
        "/assets/images/makimono.png"
      ),
      new Items(
        "YouTube投稿",
        "sale",
        0,
        100,
        100,
        100,
        50000,
        "/assets/images/douga_haishin_youtuber.png"
      ),
      new Items(
        "グッズ販売",
        "sale",
        0,
        100,
        500,
        0,
        100000,
        "/assets/images/tshirt.png"
      ),
      new Items(
        "DVD販売",
        "sale",
        0,
        500,
        3000,
        0,
        200000,
        "/assets/images/disc_case.png"
      ),
      new Items(
        "寄席開催",
        "sale",
        0,
        100,
        30000,
        0,
        500000,
        "/assets/images/building_rakugo_yose.png"
      ),
      new Items(
        "出版",
        "sale",
        0,
        30,
        100000,
        100000,
        1000000,
        "/assets/images/book_sasshi2_yellow.png"
      ),
    ];

    if (
      userName === "松ちゃん" ||
      userName === "浜ちゃん" ||
      userName === "ダウンタウン"
    )
      return new User(userName, 1, 0, Math.pow(10, 9), itemsList, 30000);
    return new User(userName, 1, 0, 30000, itemsList);
  }

  static purchaseItems(user, index, count) {
    if (count <= 0 || count % 1 != 0) {
      alert("不正な値です。");
    } else if (
      Controller.getTotalPrice(user.items[index], count) > user.money
    ) {
      alert("所持金が足りません。");
    } else if (
      user.items[index].currentAmount + count > user.items[index].maxAmount &&
      user.items[index].type !== "authorsity"
    ) {
      alert("これ以上の購入はできません。");
    } else {
      user.money -= Controller.getTotalPrice(user.items[index], count);
      user.items[index].currentAmount += Number(count);
      Controller.updateUserIncome(user, user.items[index], count);
    }
  }

  static getTotalPrice(item, count) {
    let total = 0;
    count = Number(count);
    if (count > 0 && count % 1 == 0) return (total += item.price * count);
    else return total;
  }

  static updateUserIncome(user, items, count) {
    count = Number(count);
    if (items.type === "ability") {
      user.incomePerClick += items.perMoney * count;
    } else if (items.type === "authority") {
      user.incomePerSec += user.stock * items.perRate;
    } else if (items.type === "sale") {
      user.incomePerSec += items.perMoney * count;
    }
  }

  static startTimer(user) {
    Controller.timer = setInterval(function () {
      user.days++;
      user.money += user.incomePerSec;
      if (user.days % 365 === 0) {
        user.years++;
        View.updateUserInfo(user);
      } else {
        View.updateUserInfo(user);
      }
    }, 1000);
  }

  static stopTimer() {
    clearInterval(Controller.timer);
  }

  static updateByClick(user) {
    user.clickCount++;
    user.money += user.incomePerClick;
    View.updateManzaiPage(user);
    View.updateUserInfo(user);
  }

  static resetAllData(user) {
    if (window.confirm("データをリセットしますか？")) {
      let userName = user.name;
      user = Controller.createInitialUserAccount(userName);
      Controller.stopTimer();
      View.updateMainPage(user);
      Controller.startTimer(user);
    }
  }

  static saveUserData(user) {
    localStorage.setItem(user.name, JSON.stringify(user));
    alert(
      "セーブが完了しました。次回プレイ時は同じ名前を入力してログインボタンを押してください。"
    );
  }

  static getUserData(userName) {
    return JSON.parse(localStorage.getItem(userName));
  }

  static initializePage() {
    config.initialPage.classList.remove("d-none");
    config.initialPage.innerHTML = "";
    config.mainPage.innerHTML = "";
    Controller.startGame();
  }
}

Controller.startGame();
