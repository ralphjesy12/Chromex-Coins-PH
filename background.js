var last = 0;

document.addEventListener('DOMContentLoaded', function () {
    refreshPrice();
});

function refreshPrice(){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://quote.coins.ph/v1/markets", true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            try {
                var resp = JSON.parse(xhr.responseText);

                price = resp.markets[4].ask;
                text = (Math.round(price/1000));
                if(last > price){
                    chrome.browserAction.setBadgeBackgroundColor({
                        color : "#800000"
                    });
                }
                else if(last == price){
                    chrome.browserAction.setBadgeBackgroundColor({
                        color : "#000080"
                    });
                }
                else{
                    chrome.browserAction.setBadgeBackgroundColor({
                        color : "#008000"
                    });
                }

                last = price;

                expiry = resp.markets[4].expires_in_seconds * 1000;
                if(expiry <= 0 ) expiry = 1000;

                chrome.browserAction.setBadgeText({text: text + 'K' });
                chrome.browserAction.setTitle({
                    title : 'PHP ' + price
                });

                setTimeout(function(){
                    refreshPrice();
                },expiry);

            } catch(e) {
                console.warn(e);
                chrome.browserAction.setBadgeText({text: '$$$' });
            }
        }
    }
    xhr.send();

}
