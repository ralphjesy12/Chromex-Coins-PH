var refreshinterval = null;

window.addEventListener('load', function () {

    checkUpdates();

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


function checkVersion(version){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://raw.githubusercontent.com/ralphjesy12/Chromex-Coins-PH/master/manifest.json", true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            try {
                clearInterval(refreshinterval);
                var resp = JSON.parse(xhr.responseText);
                if(resp && resp.version){

                    updatetext = document.getElementById("update-text");
                    
                    if(version != resp.version){
                        updatetext.innerHTML = 'Update Available';
                        updatetext.setAttribute('href','https://github.com/ralphjesy12/Chromex-Coins-PH/archive/master.zip');
                    }else{
                        updatetext.innerHTML = 'View Chart';
                        updatetext.setAttribute('href','https://www.coingecko.com/en/price_charts/bitcoin/php');
                    }

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
                }

            } catch(e) {
                console.warn(e);

                refreshinterval = setInterval(function(){
                    checkUpdates();
                },5000);
            }
        }
    }

    xhr.send();
}

function checkUpdates(){
    chrome.runtime.getPackageDirectoryEntry(function(root) {
        root.getFile("manifest.json", {}, function(fileEntry) {
            fileEntry.file(function(file) {
                var reader = new FileReader();
                reader.onloadend = function(e) {
                    var manifest = JSON.parse(this.result);
                    /*do here whatever with your JS object(s)*/
                    if(manifest && manifest.version){
                        checkVersion(manifest.version);
                    }

                };
                reader.readAsText(file);
            });
        });
    });
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
