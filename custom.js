const download = document.getElementById("download");
const upload = document.getElementById("upload");
const latency = document.getElementById("latency");
let upload_start = null;
let upload_end = null;
let data_length = null;

async function getTransferredBytes(url) {
  try {
    const start_time = Date.now();
    const response = await fetch(url, {cache: 'no-store'});

    // Check if the response body is a ReadableStream
    if (!response.body) {
      console.warn('Response body is not a ReadableStream. Cannot track progress.');
      return null;
    }

    const reader = response.body.getReader();
    let receivedLength = 0;
    const chunks = [];

    while (true) {
      const local_start_time = Date.now();
      const { done, value } = await reader.read();
      const local_time = (Date.now() - local_start_time) / 1000

      if (done) {
        break; // All data has been read
      }

    //   console.log("Speed", ((value.length * 8) / local_time) / 1000000, "Mbs");
      download.innerText = (((value.length * 8) / local_time) / 1000000).toFixed(2);

      chunks.push(value);
      receivedLength += value.length; // Add the length of the current chunk

    }

    // You can also get the Content-Length header for the total expected size, if available
    const contentLength = response.headers.get('Content-Length');
    if (contentLength) {
      console.log(`Expected Content-Length: ${contentLength} bytes`);
    }

    console.log(`Total bytes received: ${receivedLength} bytes`);
    let time = (Date.now() - start_time) / 1000
    // console.log("Total speed", ((receivedLength * 8) / time) / 1000000, "Mbs");
    download.innerText = (((receivedLength * 8) / time) / 1000000).toFixed(2);
    return receivedLength;

  } catch (error) {
    console.error('Error during fetch:', error);
    return null;
  }
}

async function getPing(url) {
  try {
    const start_time = Date.now();
    const response = await fetch(url, {cache: 'no-store'});
    latency.innerText = (Date.now() - start_time);

  } catch (error) {
    console.error('Error during fetch:', error);
    return null;
  }
}

async function sendDataToServer(url, data) {
  try {
    data_length = data.length;
    const start_time = Date.now();
    upload_start = start_time;

    const response = await fetch(url, {
    method: 'POST', // Specify the HTTP method
    //   headers: {
    //     'Content-Type': 'application/json' // Inform the server about the data type
    //   },
    // headers: {
    //   "Content-Type": "application/octet-stream"
    // },
    body: data,//JSON.stringify(data) // Convert the JavaScript object to a JSON string
    });

    // if (!response.ok) {
    // //   throw new Error(`HTTP error! status: ${response.status}`);
    //     console.log("here")
    // }

    const end_time = (Date.now() - start_time) / 1000;
    upload_end = end_time;

    upload.innerText = (((data.length * 8) / end_time) / 1000000).toFixed(2);

  } catch (error) {
    console.error('Error sending data:', error);
    throw error; // Re-throw the error for further handling
  }
}


function checkUpload(){
    if (upload_start) {
        const time = (Date.now() - upload_start) / 1000
        upload.innerText = (((data_length * 8) / time) / 1000000).toFixed(2);
    }

    if (!upload_end) {
        setTimeout(checkUpload, 50)
    }
}



// async function uploadFiles(url) {
// //   new Promise((resolve, reject) => {
//     const xhr = new XMLHttpRequest();
//     const success = await new Promise((resolve)=> {
//         xhr.upload.addEventListener('progress', e => console.log(e.loaded / e.total));
//         // xhr.addEventListener('load', () => resolve({ status: xhr.status, body: xhr.responseText }));
//         // xhr.addEventListener('error', () => reject(new Error('File upload failed')));
//         // xhr.addEventListener('abort', () => reject(new Error('File upload aborted')));
//         xhr.open('POST', url, true);
//         xhr.setRequestHeader("content-type", "text/plain;charset=UTF-8");
//         xhr.send("hi");
//     })

//     // // const formData = new FormData();
//     // // Array.from(files).forEach((file, index) => formData.append(index.toString(), file));
//     // xhr.send(files);
// //   }
// };

// uploadFiles("https://raw.githubusercontent.com/konsoleSam/internet-speed-test/refs/heads/main/ping.txt");

async function runSpeedTest(){
    document.getElementById("status").innerText = "";
    const button = document.getElementById("button");
    button.disabled = true
    // button.style.display = "none"
    await getPing("https://raw.githubusercontent.com/konsoleSam/internet-speed-test/refs/heads/main/ping.txt");

    // Example usage:
    await getTransferredBytes('https://raw.githubusercontent.com/konsoleSam/internet-speed-test/refs/heads/main/speed-test.png')
    .then(bytes => {
        if (bytes !== null) {
        console.log(`Fetch completed, total bytes: ${bytes}`);
        }
    });

    upload_start = null;
    upload_end = null;
    data_length = null;
    checkUpload();
    await sendDataToServer("https://raw.githubusercontent.com/konsoleSam/internet-speed-test/refs/heads/main/ping.txt", "b".repeat(2000000));

    document.getElementById("status").innerText = "Speed Test Complete";
    button.disabled = false;
}

