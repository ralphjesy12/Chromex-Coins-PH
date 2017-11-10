window.addEventListener('load', function () {
    refreshPrice();

    var links = document.getElementsByTagName("a");
    for (var i = 0; i < links.length; i++) {
        (function () {
            var ln = links[i];
            var location = ln.href;
            ln.onclick = function () {
                chrome.tabs.create({active: true, url: location});
            };
        })();
    }
});

function prioritizeIndexBySymbol(markets,symbol) {
    var pos = 0;
    for(var i = 0; i < markets.length; i++) {
        if (markets[i].symbol == symbol) {
            pos = i;
            continue;
        }
    }

    markets.splice(0, 0, markets[pos++]);
    markets.splice(pos, 1);

    return markets;
}

function refreshPrice(){
    var xhr = new XMLHttpRequest();

    xhr.open("GET", "https://quote.coins.ph/v1/markets?per_page=100", true);
    xhr.onreadystatechange = function() {

        pricetext = document.getElementById("prices");

        if (xhr.readyState == 4) {
            try {
                var resp = JSON.parse(xhr.responseText);

                price = resp.markets[4].ask;
                text = (Math.round(price/1000));

                expiry = resp.markets[4].expires_in_seconds * 1000;
                if(expiry <= 0 ) expiry = 1000;

                resp.markets = prioritizeIndexBySymbol(resp.markets,'BTC-USD');
                resp.markets = prioritizeIndexBySymbol(resp.markets,'BTC-PHP');

                if(pricetext){
                    pricetext.innerHTML = '';
                    for (var i = 0; i < resp.markets.length; i++) {
                        pricehere = resp.markets[i];
                        pricetext.innerHTML += '<li class="currency"><span class="symbol">' + pricehere.symbol + '</span> <span class="ask-price"><small>buy @ </small>' + pricehere.ask + '</span><span class="bid-price"><small>sell @ </small>' + pricehere.bid + '</span></li>';
                    }
                }
                setTimeout(function(){
                    refreshPrice();
                },expiry);

            } catch(e) {
                console.warn(e);
                pricetext.innerHTML = 'Prices are not available at this moment. Please try again later or visit <a href="https://coins.ph/charts">Coins.ph</a>'
            }
        }
    }

    xhr.send();

}
