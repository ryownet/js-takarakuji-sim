
(function(w){
  "use strict";

  var $ = w.jQuery;


// Util
var kujiUtil = {
  interval: null,
  TANKA : 300,
  INTERVAL: 2,
  zeroPad: function (num, keta){
    var zero = '';
    for(var i = 0; i<keta; i++){
      zero += '0';
    }
    return ( zero + num).substr(-keta);
  },
  start: function () {
    kujiUtil.interval = setInterval(kujiUtil.getKuji, kujiUtil.INTERVAL);
     $('button[data-click=start]').attr('disabled', 'disabled');
     $('button[data-click=stop]').removeAttr('disabled');
  },
  stop: function () {
    clearInterval( kujiUtil.interval);
     $('button[data-click=start]').removeAttr('disabled');
     $('button[data-click=stop]').attr('disabled', 'disabled');
  },
  getKuji: function () {
    var k = new Kuji();
    viewModel.dispResult( judge(k) );
  },
  atariArr : []
};



/*
 くじクラス
 */
var Kuji = function () {
  var self = this;

  // 組は2けたのゼロ埋め数字
  self.kumi = kujiUtil.zeroPad( Math.floor( Math.random() * 100 ), 2);

  // 番号は6けたのゼロ埋め数字
  self.bangou = kujiUtil.zeroPad( Math.floor( Math.random() * 100000 ), 6 );

  self.name = function () {
    return self.kumi + '組' + self.bangou + '番';
  }
}

/*
 あたり判定テストケース
 */
var atariKuji = function () {
  var self = this;
  self.kumi = '87';
  self.bangou = '178686';

  self.name = function(){
    return self.kumi + '組' + self.bangou + '番';
  }
}

/*
 viewとデータを両方扱うもの
 */
var viewModel = {
  atariList: [],
  totalGetMoney: 0,
  totalSpendMoney: 0,
  totalKujiCount: 0,
  el: {
    totalGetMoney: $('#kakutoku').find('span[data-txt=kakutoku]'),
    totalSpendMoney: $('#total').find('span[data-txt=total]'),
    totalKujiCount: $('#maisuu').find('span[data-txt=maisuu]'),
    totalSagaku: $('#sagaku').find('span[data-txt=sagaku]'),
    out: {}
  },
  setAtari: function ( atariObj ) {
    viewModel.totalGetMoney += atariObj.kingaku;
    viewModel.atariList[atariObj.category]++;
  },
  dispResult: function ( atariObj ){
    if( atariObj.name ){
      //  console.time('t')
      viewModel.setAtari(atariObj);
      var sagaku = viewModel.totalGetMoney - viewModel.totalSpendMoney;
      viewModel.el.out['cat'+atariObj.category].text( viewModel.atariList[atariObj.category] );
      viewModel.el.totalSpendMoney.text((viewModel.totalSpendMoney).toLocaleString() );
      viewModel.el.totalGetMoney.text( (viewModel.totalGetMoney).toLocaleString() );
      viewModel.el.totalKujiCount.text( (viewModel.totalKujiCount).toLocaleString() );
      viewModel.el.totalSagaku.text( sagaku.toLocaleString() );

      if(sagaku < 0){
        viewModel.el.totalSagaku.addClass('is-minus');
      }else{
        viewModel.el.totalSagaku.removeClass('is-minus');

      }
      //console.timeEnd('t')
    }
    viewModel.totalKujiCount++;
    viewModel.totalSpendMoney += kujiUtil.TANKA;
  }
}


/*
* 判定
* @param Kuji
* @return object
* TODO: 高速化
*/
var judge = function (kuji) {
  var isSameKumi = false;
  var isSameBan = false;
  var arr = kujiUtil.atariArr;
  var l = arr.length;
  for(var i=0;i<l; i++){
    //各当選回ごとにジャッジをリセット
    var isSameKumi_ = false;
    var isSameBan_ = false;
    if(arr[i].atari.kumi === kuji.kumi){
      isSameKumi_ = true;
    }else if(arr[i].atari.kumi === '##'){
      isSameKumi_ = true;
    }
    if(!isSameKumi_) continue;
    if(arr[i].atari.bangou === kuji.bangou){
      isSameBan_ = true;
    }else{
      if(arr[i].atari.bangou.indexOf('#') !== -1){

        // ＃の個数を数え、くじ番号で#の個数分を前方から削除して判定
        var komeNum = arr[i].atari.bangou.split('#').length-1;

        // くじ番号で#の個数分だけ消す
        var kujiBanNumArr = kuji.bangou.split('');
        for(var j=0; j<komeNum; j++){
         kujiBanNumArr[j] = '';
       }
       var kujiBanNum = kujiBanNumArr.join('');
       if(kujiBanNum ===  arr[i].atari.bangou.substr(komeNum)){
          isSameBan_ = true;
        }
      }
    }
    if( isSameBan_ && isSameKumi_){
      isSameKumi = isSameKumi_;
      isSameBan = isSameBan_;
      //あたり
      return arr[i];
    }
  }

  return {};
}






$(document).ready(function (){
  $.getJSON('js/setting.json', function (data){
    kujiUtil.atariArr = data;

    var l = kujiUtil.atariArr.length;
    var category = '';
    for(var i=0; i< l; i++){
      if(kujiUtil.atariArr[i].category === category) continue;
      category = kujiUtil.atariArr[i].category;
      viewModel.atariList[category] = 0;
      var $div = $('<div class="koma clearfix"></div>');
      var kingaku = ((+kujiUtil.atariArr[i].kingaku) ).toLocaleString();
      var str = [
        '<div class="ttl-atari">',
        kujiUtil.atariArr[i].name,
        '<span class="kingaku">',
        kingaku,
        '<span class="unit">円</span></span></div>',
        '<div class="mai">× <span data-category="' + category +'">0</span></div>'
      ].join('');
      $div.append(str);
      $('#out').append($div);
      viewModel.el.out['cat'+ category] = $('#out').find('span[data-category='+category+ ']');
    }

    var $startBtn = $('button[data-click=start]');
    var $stopBtn = $('button[data-click=stop]');

    $startBtn.removeAttr('disabled');

    $startBtn.on('click', function (){
      kujiUtil.start();
    });
    $stopBtn.on('click', function (){
      kujiUtil.stop();
    });
  })
});




})(window);
