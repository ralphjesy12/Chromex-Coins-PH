var last = 0;
var lowest = Number.MAX_SAFE_INTEGER;
var highest = 0;
var lastday = (new Date()).getDate();
var id = 0;
var refreshinterval = null;
document.addEventListener('DOMContentLoaded', function () {
    refreshPrice();
});

function refreshPrice(){

    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://quote.coins.ph/v1/markets", true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            try {
                clearInterval(refreshinterval);
                var resp = JSON.parse(xhr.responseText);

                market = resp.markets.filter(function( obj ) {
                    return obj.symbol == 'BTC-PHP';
                });

                market = market[0];

                price = market.ask;
                priceSell = market.bid;



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

                expiry = market.expires_in_seconds * 1000;
                if(expiry <= 0 ) expiry = 1000;

                chrome.browserAction.setBadgeText({text: text + 'K' });
                chrome.browserAction.setTitle({
                    title : 'PHP ' + price
                });

                // notifications


                if(lastday != (new Date()).getDate()){

                    lastday = (new Date()).getDate();
                    lowest = Number.MAX_SAFE_INTEGER;
                    highest = 0;
                }

                if(price < lowest){
                    lowest = price;

                    id++;
                    chrome.notifications.create(
                        'id-1',{
                            type:"basic",
                            title:"BTC Price Update",
                            message:"Lowest Today : " + "\n" + "Buy:" + price + "\n" + "Sell: " + priceSell,
                            iconUrl:"images/coins-48.png"
                        },
                    );

                }

                if(price > highest){
                    highest = price;

                    id++;
                    chrome.notifications.create(
                        'id-1',{
                            type:"basic",
                            title:"BTC Price Update",
                            message:"Highest Today : " + "\n" + "Buy:" + price + "\n" + "Sell: " + priceSell,
                            iconUrl:"images/coins-48.png"
                        },
                    );
                }

                setTimeout(function(){
                    refreshPrice();
                },expiry);

            } catch(e) {
                console.warn(e);
                chrome.browserAction.setBadgeText({text: '$$$' });

                refreshinterval = setInterval(function(){
                    refreshPrice();
                },5000);
            }
        }
    }

    xhr.send();

}
