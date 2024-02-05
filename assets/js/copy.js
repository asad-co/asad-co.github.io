function copyText() {
    var copyText = document.querySelector('#email');
    var tempTextArea = document.createElement('textarea');
    tempTextArea.value = copyText.textContent;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    document.execCommand('copy');
    document.body.removeChild(tempTextArea);

    // You can also provide some visual feedback to the user
    var copyButton = document.querySelector('#copytxt');
    copyButton.innerText = 'Copied!';
    setTimeout(function () {
        copyButton.innerText = '';
    }, 2000);
}