var maxlines= 24;
var charTyped = 0;
let wordList = [];
let targetPass = "";
let nextChar = "";
let timesTyped = 3;
let start_time = 0;
const maxTimes = 3;
let UUID = null;
const post_url = "https://script.google.com/macros/s/AKfycbwowQAsWeyj7yi_hJ0amCg5lmWFSLp9ARTP1f111xEfPpVj4tQ1KjW0kbtkP_XDow/exec";
const get_url = "https://script.google.com/macros/s/AKfycbyew5fZh48bbc_2Rc5bTri_VMndiSziF2r7YX8-E37XScKNmvdZ9rYB9lNkK0xH84dc/exec";
let dataList = [];
let charDict = {};
let mustRedo = false;
let passwords_completed = -1;
let passwords_goal = 20;
let checkpoint = false;
let kut = [];
let kuk = [];
let kdt = [];
let kdk = [];
let kpt = [];
let kpk = [];

function loadFile(rows) {
    UUID = crypto.randomUUID();
    getWords(rows).then(data => {
        console.log(data);
        wordList = wordList.concat(data);
        displayPassword();
    });
}

async function getWords(rows) {
    try {
        document.getElementById("pass_input0").innerHTML = "Loading words...";
        const response = await fetch(get_url+"?rows="+rows, {
          method: 'GET', // POST request
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json(); // Parse JSON response
      } catch (error) {
        console.error('Error:', error); // Handle error
      }  
}

function displayNewPassword() {
    if (passwords_completed == -1) {
      if (checkpoint) {
        checkpoint = false;
        loadFile("1");
      } else {
        loadFile("1,2");
      }
      passwords_completed = 0;
      return null;
    }
    passwords_completed++;
    document.getElementById("pass_count").innerHTML = passwords_completed;

    if (wordList.length === 0) {
      if (passwords_completed >= passwords_goal) {
        checkpoint = true;
        passwords_goal = 10;
        passwords_completed = -1;
        charTyped = 0;
        targetPass = "";
        timesTyped = maxTimes;
        document.getElementById("pass_input0").innerHTML = "Thank you for completing this survey! If you would like to keep going, please click 'Enter' and we will provide you with 10 more paswords!"
        document.getElementById("pass_input1").innerHTML = "";
        document.getElementById("pass_input2").innerHTML = "";
        return null;
      } else {
        console.log('File not yet loaded or empty.');
        document.getElementById("pass_input0").innerHTML = "Oh no! It appears that our website is not working right now. \n Please try again later. Thank you!"
        document.getElementById("pass_input1").innerHTML = "";
        document.getElementById("pass_input2").innerHTML = "";
        return null;
      }
    }

    displayPassword();
}

function displayPassword() {
  const randomIndex = Math.floor(Math.random() * wordList.length);
  targetPass = String(wordList[randomIndex]);
  wordList.splice(randomIndex, 1);
  console.log(wordList);
  nextChar = targetPass[0];
  console.log("Getting new password", targetPass);
  document.getElementById("pass_input0").innerHTML = targetPass;
  document.getElementById("pass_input1").innerHTML = "";
  document.getElementById("pass_input2").innerHTML = "";

  dataList = [];
  charDict = {};
  charDict['UUID'] = UUID;
  charDict['Password'] = targetPass;
}

function init()
{
    if (document.addEventListener)
    {
       document.addEventListener("keydown",keydown,false);
       document.addEventListener("keypress",keypress,false);
       document.addEventListener("keyup",keyup,false);
       document.addEventListener("textInput",textinput,false);
    }
    else if (document.attachEvent)
    {
       document.attachEvent("onkeydown", keydown);
       document.attachEvent("onkeypress", keypress);
       document.attachEvent("onkeyup", keyup);
       document.attachEvent("ontextInput", textinput);
    }
    else
    {
       document.onkeydown= keydown;
       document.onkeypress= keypress;
       document.onkeyup= keyup;
       document.ontextinput= textinput;   // probably doesn't work
    }
}

function keyval(n)
{
    if (n == null) return 'undefined';
    var s= pad(3,n);
    if (n >= 32 && n < 127) s+= ' (' + String.fromCharCode(n) + ')';
    while (s.length < 9) s+= ' ';
    return s;
}

// function keymesg(w,e)
// {
//     var pressTime = performance.now();
// 	  // console.log(
//     //         ' keyCode=' + keyval(e.keyCode) +
// 	  //         ' which=' + keyval(e.which) +
//     //         ' charCode=' + keyval(e.charCode) + (pressTime));
//     charDict[w] = pressTime;
// }

function pad(n,s)
{
   s+= '';
   while (s.length < n) s+= ' ';
   return s;
}

function suppressdefault(e,flag)
{
   if (flag)
   {
       if (e.preventDefault) e.preventDefault();
       if (e.stopPropagation) e.stopPropagation();
   }
   return !flag;
}

function keydown(e)
{
   if (!e) e= event;
   charDict['keydown'] = performance.now();
   kdt.push(performance.now());
   kdk.push(e.key);
  return suppressdefault(e,false);
}

function keyup(e)
{
    if (!e) e= event;
    charDict['keyup'] = performance.now();
    kut.push(performance.now());
    kuk.push(e.key);
    return suppressdefault(e,false);
}

function keypress(e)
{
  if (!e) e= event;
  charDict['keypress'] = performance.now();
  kpt.push(performance.now());
  kpk.push(e.key);
  handleWebsite(e).then();
  return suppressdefault(e,true);
}

async function handleWebsite(e) {
  if (e.key === 'Enter' && mustRedo) {
    document.getElementById('pass_input' + timesTyped.toString()).innerHTML = targetPass;
    mustRedo = false;
    return suppressdefault(e,true);
  }

  if (charTyped >= targetPass.length && e.key === 'Enter') {
    timesTyped++;
    start_time = 0;
    charTyped = 0;
    if (timesTyped >= maxTimes) {
        charDict['keyup'] = String(kut);
        charDict['keydown'] = String(kuk);
        dataList.push(charDict);
        postData({ key: 'value' })
        .then(data => console.log(data));
        console.log(dataList);
        displayNewPassword();
        timesTyped = 0;
    } else {
        document.getElementById("pass_input" + timesTyped.toString()).innerHTML = targetPass;
    }
    return suppressdefault(e,true);
  }

   const textarea = document.getElementById('pass_input' + timesTyped.toString());
   nextChar = targetPass[charTyped];
   if (e.key === nextChar) {
       charTyped++;
       const ungreyText = targetPass.substring(0, charTyped); // Text to un-grey
       const greyText = targetPass.substring(charTyped); // Remaining grey text
       textarea.innerHTML = `<span style="color: white;">${ungreyText}</span>${greyText}`;
      //  charDict['Char'] = charTyped - 1;
      //  charDict['Trial'] = timesTyped;
      //  dataList.push(charDict);
      //  charDict = {};
      //  charDict['UUID'] = UUID;
      //  charDict['Password'] = targetPass;
    } else {
        const ungreyText = targetPass.substring(0, charTyped); // Text to un-grey
        const greyText = targetPass.substring(charTyped); // Remaining grey text
        textarea.innerHTML = `<span style="color: white;">${ungreyText}</span><span style="color: red;">${e.key}</span>${greyText}   <span style="color: red;">Oops! Press 'Enter' to redo this password.</span>`;
        mustRedo = true;

        // Reset counters for chars in current trial
        charTyped = 0;
        nextChar = targetPass[0];

        // Reset character dictionary
        charDict = {};
        charDict['UUID'] = UUID;
        charDict['Password'] = targetPass;

        // Remove old charDicts from dataList
        const charsTyped = targetPass.length * timesTyped;
        dataList.splice(charsTyped);

        console.log(dataList);
        console.log("Incorrect! " + e.key);
    }
}

function textinput(e)
{
   if (!e) e= event;
   //showmesg('textInput  data=' + e.data);
   console.log('textInput data='+e.data);
   return suppressdefault(e,true);
}

async function postData() {
    try {
      const response = await fetch(post_url, {
        method: 'POST', // POST request
        body: JSON.stringify(dataList) // Convert data to JSON
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      return await response.json(); // Parse JSON response
    } catch (error) {
      console.error('Error:', error); // Handle error
    }
  }
  