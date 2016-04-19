/**
 * Tronquer une chaine selon un nombre de caractères
 *
 * from https://github.com/igreulich/angular-truncate
 */
app
.filter('truncate', function () {
    return function (text, length, end){
        if (text !== undefined){
            if (isNaN(length)){
                length = 10;
            }

            end = end || "...";

            if (text.length <= length || text.length - end.length <= length){
                return text;
            }
            else {
                return String(text).substring(0, length - end.length) + end;
            }
        }
    };
})


/**
 * Tronquer une chaine selon un nombre de mots
 */
.filter('truncatewords', function() {
    return function(text, length) {
        if(text !== undefined) {
            var orTab = text.split(" ");

            if(orTab.length <= length) {
                return orTab.join(" ");
            }
            else {
                var tab = orTab.slice(0, length);
                return tab.join(" ") + "...";
            }
        }
    }
})


/**
 * Ajoute un s au mot demandé si la valeur est supérieur à 1
 */
.filter('plural', function() {
    return function(nb, word) {
        if(nb !== undefined) {
            if(nb > 0) {
                return nb + " " + word + "s";
            }
            else if(nb >= 0 && nb < 2) {
                return nb + " " + word;
            }
        }
    }
})


.filter('percentagewidth', function() {
    return function(part, otherpart) {
        if(part !== undefined) {
            return "width:" + (part/(part+otherpart))*100 + "%"
        }
    }
})
