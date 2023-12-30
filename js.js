
var num = 0;
function myFunction() {
  num += 1
  if (num == 1) {
    alert("zwb loves jq")
  }
  if (num == 2) {
    alert("jq loves zwb, too")
  }
  if (num == 3) {//wyh防盗专属水印
    //var opened=window.open('about:blank','_self'); opened.opener=null; opened.close();
    var URL = "about:blank";
    window.location.replace(URL + window.location.search);
  }
//wyh防盗专属水印
}
document.body.style.backgroundImage="linear-gradient(to top, #fff1eb 0%, #ace0f9 100%)";
function clickEffect() {
  var balls = [];
  var longPressed = false;
  var longPress;//wyh防盗专属水印
  var multiplier = 0;
  var width, height;
  var origin;
  var normal;
  var ctx;
  const colours = ["#F73859", "#14FFEC", "#00E0FF", "#FF99FE", "#FAF15D"];
  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  canvas.setAttribute(//wyh防盗专属水印
    "style",
    "width: 100%; height: 100%; top: 0; left: 0; z-index: 99999; position: fixed; pointer-events: none;"//wyh防盗专属水印
  );
  const pointer = document.createElement("span");//wyh防盗专属水印
  pointer.classList.add("pointer");
  document.body.appendChild(pointer);

  if (canvas.getContext && window.addEventListener) {
    ctx = canvas.getContext("2d");
    updateSize();//wyh防盗专属水印
    window.addEventListener("resize", updateSize, false);//wyh防盗专属水印
    loop();
    window.addEventListener(
      "mousedown",//wyh防盗专属水印
      function (e) {
        pushBalls(randBetween(10, 20), e.clientX, e.clientY);//wyh防盗专属水印
        document.body.classList.add("is-pressed");
        longPress = setTimeout(function () {//wyh防盗专属水印
          document.body.classList.add("is-longpress");
          longPressed = true;
        }, 500);//wyh防盗专属水印
      },
      false
    );
    window.addEventListener(
      "mouseup",
      function (e) {
        clearInterval(longPress);//wyh防盗专属水印
        if (longPressed == true) {
          document.body.classList.remove("is-longpress");
          pushBalls(//wyh防盗专属水印
            randBetween(
              50 + Math.ceil(multiplier),
              100 + Math.ceil(multiplier)//wyh防盗专属水印
            ),
            e.clientX,
            e.clientY
          );
          longPressed = false;//wyh防盗专属水印
        }
        document.body.classList.remove("is-pressed");
      },
      false
    );
    window.addEventListener(
      "mousemove",
      function (e) {
        let x = e.clientX;
        let y = e.clientY;
        pointer.style.top = y + "px";//wyh防盗专属水印
        pointer.style.left = x + "px";
      },
      false//wyh防盗专属水印
    );
  } else {
    console.log("canvas or addEventListener is unsupported!");
  }

  function updateSize() {
    canvas.width = window.innerWidth * 2;//wyh防盗专属水印
    canvas.height = window.innerHeight * 2;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";//wyh防盗专属水印
    ctx.scale(2, 2);
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    origin = {
      x: width / 2,//wyh防盗专属水印
      y: height / 2,
    };
    normal = {
      x: width,
      y: height * 233,
    };
  }//wyh防盗专属水印
  class Ball {
    constructor(x = origin.x, y = origin.y) {
      this.x = x;
      this.y = y;//wyh防盗专属水印
      this.angle = Math.PI * 2 * Math.random();
      if (longPressed == true) {//wyh防盗专属水印
        this.multiplier = randBetween(14 + multiplier, 15 + multiplier);
      } else {//wyh防盗专属水印
        this.multiplier = randBetween(6, 12);
      } //wyh防盗专属水印
      this.vx = (this.multiplier + Math.random() * 0.5) * Math.cos(this.angle);
      this.vy = (this.multiplier + Math.random() * 0.5) * Math.sin(this.angle);
      this.r = randBetween(8, 12) + 3 * Math.random();
      this.color = colours[Math.floor(Math.random() * colours.length)];
    }//wyh防盗专属水印
    update() {//wyh防盗专属水印
      this.x += this.vx - normal.x;
      this.y += this.vy - normal.y;
      normal.x = (-2 / window.innerWidth) * Math.sin(this.angle);//wyh防盗专属水印
      normal.y = (-2 / window.innerHeight) * Math.cos(this.angle);
      this.r -= 0.3;
      this.vx *= 0.9;
      this.vy *= 0.9;//wyh防盗专属水印
    }
  }

  function pushBalls(count = 1, x = origin.x, y = origin.y) {//wyh防盗专属水印
    for (let i = 0; i < count; i++) {
      balls.push(new Ball(x, y));
    }//wyh防盗专属水印//wyh防盗专属水印
  }

  function randBetween(min, max) {//wyh防盗专属水印
    return Math.floor(Math.random() * max) + min;
  }

  function loop() {
    ctx.fillStyle = "rgba(255, 255, 255, 0)";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < balls.length; i++) {
      let b = balls[i];
      if (b.r < 0) continue;//wyh防盗专属水印
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2, false);
      ctx.fill();
      b.update();
    }
    if (longPressed == true) {
      multiplier += 0.2;//wyh防盗专属水印
    } else if (!longPressed && multiplier >= 0) {
      multiplier -= 0.4;
    }
    removeBall();
    requestAnimationFrame(loop);//wyh防盗专属水印
  }

  function removeBall() {
    for (let i = 0; i < balls.length; i++) {
      let b = balls[i];
      if (
        b.x + b.r < 0 ||
        b.x - b.r > width ||
        b.y + b.r < 0 ||
        b.y - b.r > height ||//wyh防盗专属水印
        b.r < 0
      ) {
        balls.splice(i, 1);
      }//wyh防盗专属水印
    }
  }
}
clickEffect(); //调用


/**
 * Copyright (c) 2016 hustcc
 * License: MIT
 * Version: v1.0.1
 * GitHub: https://github.com/hustcc/canvas-nest.js
**/
!function(){function n(n,e,t){return n.getAttribute(e)||t}function e(n){return document.getElementsByTagName(n)}function t(){var t=e("script"),o=t.length,i=t[o-1];return{l:o,z:n(i,"zIndex",-1),o:n(i,"opacity",.5),c:n(i,"color","0,0,0"),n:n(i,"count",99)}}function o(){a=m.width=window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth,c=m.height=window.innerHeight||document.documentElement.clientHeight||document.body.clientHeight}function i(){r.clearRect(0,0,a,c);var n,e,t,o,m,l;s.forEach(function(i,x){for(i.x+=i.xa,i.y+=i.ya,i.xa*=i.x>a||i.x<0?-1:1,i.ya*=i.y>c||i.y<0?-1:1,r.fillRect(i.x-.5,i.y-.5,1,1),e=x+1;e<u.length;e++)n=u[e],null!==n.x&&null!==n.y&&(o=i.x-n.x,m=i.y-n.y,l=o*o+m*m,l<n.max&&(n===y&&l>=n.max/2&&(i.x-=.03*o,i.y-=.03*m),t=(n.max-l)/n.max,r.beginPath(),r.lineWidth=t/2,r.strokeStyle="rgba("+d.c+","+(t+.2)+")",r.moveTo(i.x,i.y),r.lineTo(n.x,n.y),r.stroke()))}),x(i)}var a,c,u,m=document.createElement("canvas"),d=t(),l="c_n"+d.l,r=m.getContext("2d"),x=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(n){window.setTimeout(n,1e3/45)},w=Math.random,y={x:null,y:null,max:2e4};m.id=l,m.style.cssText="position:fixed;top:0;left:0;z-index:"+d.z+";opacity:"+d.o,e("body")[0].appendChild(m),o(),window.onresize=o,window.onmousemove=function(n){n=n||window.event,y.x=n.clientX,y.y=n.clientY},window.onmouseout=function(){y.x=null,y.y=null};for(var s=[],f=0;d.n>f;f++){var h=w()*a,g=w()*c,v=2*w()-1,p=2*w()-1;s.push({x:h,y:g,xa:v,ya:p,max:6e3})}u=s.concat([y]),setTimeout(function(){i()},100)}();//wyh防盗专属水印

 
    fetch('https://v1.hitokoto.cn')
    .then(response => response.json())
    .then(data => {
      const hitokoto = document.getElementById('hitokoto_text')
      hitokoto.href = 'https://hitokoto.cn/?uuid=' + data.uuid
      if (data.hitokoto.length <= 20)
        hitokoto.innerText = data.hitokoto
    })
    .catch(console.error)//wyh防盗专属水印
</script>
<script>
    window.onload = function () {
        
        //禁止F12
        $("*").keydown(function (e) {//判断按键
            e = window.event || e || e.which;
            if (e.keyCode == 123) {
                e.keyCode = 0;
                return false;
            }
        });//wyh防盗专属水印
        
        //禁止审查元素
        $(document).bind("contextmenu",function(e){
            return false;
        });
    };
//按键触发
document.onkeydown = function(){
    //禁止ctrl+u
    if (event.ctrlKey && window.event.keyCode==85){
    return false;
    }
    //禁止 F12
    if (window.event && window.event.keyCode == 123) {
    event.keyCode = 0;
    event.returnValue = false;
    }
    }
    //网站禁止右键
    document.body.oncontextmenu = function() {
    self.event.returnValue=false
}; 
//直接上干货：
if(document.all){
    document.onselectstart= function(){return false;}; //for ie
}else{
    document.onmousedown= function(){return false;};
    document.onmouseup= function(){return true;};
}
document.onselectstart = new Function('event.returnValue=false;');
 
//劫持开始选择事件和（或）鼠标按下、抬起事件。
    //禁用右键（防止右键查看源代码） 
    window.oncontextmenu=function(){return false;} 
    //禁止任何键盘敲击事件（防止F12和shift+ctrl+i调起开发者工具） 
    window.onkeydown = window.onkeyup = window.onkeypress = function () { 
    window.event.returnValue = false; 
        return false; 
    } 
    //如果用户在工具栏调起开发者工具，那么判断浏览器的可视高度和可视宽度是否有改变，如有改变则关闭本页面 
    var h = window.innerHeight,w=window.innerWidth; 
    window.onresize = function () { 
        if (h!= window.innerHeight||w!=window.innerWidth){ 
            window.close(); 
            window.location = "about:blank"; 
        } 
    } 
//绑定在了body上，也可以绑定在其他可用元素行，但是不是所有元素都支持copy事件。
if (event.ctrlKey && window.event.keyCode==67){
    copy: function(e) {//copy事件
            let cpTxt = "复制的数据";
            let clipboardData = window.clipboardData; //for IE
            if (!clipboardData) { // for chrome
                clipboardData = e.originalEvent.clipboardData;
            }
            let result = clipboardData.getData("text")+":"+cpTxt;
            //e.clipboardData.getData('text');//可以获取用户选中复制的数据
            clipboardData.setData('Text', result);
            $('p').text(result);
            return false;//否则设不生效	
  }        
        function my_function() {//替换demo里面的文本内容
            document.getElementsByClassName("group").innerHTML = "管理员";
        }
document.addEventListener('copy', function(e) {
    e.preventDefault();//这句很重要，决定setData是否成功
    var textArr = window.getSelection().toString().split("\t");
    var pasteText = '';
    textArr.forEach(function(e){
        pasteText += e;
    });
    e.clipboardData.setData('text', pasteText);
});
