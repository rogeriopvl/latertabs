var LaterTabs = {

    tabs: [],

    init: function(){
        if (typeof localStorage.latertabs == 'undefined'){
            localStorage.latertabs = JSON.stringify(LaterTabs.tabs);
        }
        else{
            LaterTabs.tabs = JSON.parse(localStorage.latertabs);
        }
    },

    save: function(item){
        if (LaterTabs.tabs[item.url]){
            return false;
        }
        LaterTabs.tabs[item.url] = item;
        localStorage.latertabs = JSON.stringify(LaterTabs.tabs);
    },

    saveCurrent: function(callback){
        chrome.tabs.getSelected(null, function(tab){
            LaterTabs.save({ url: tab.url, title: tab.title });
            if (callback){ callback(); }
        });
    },

    saveAll: function(callback){
        chrome.tabs.getAllInWindow(null, function(tabs){
            for (var i=0; i < tabs.length; i++){
                LaterTabs.save({ url: tabs[i].url, title: tabs[i].title });
            }
            if (callback){ callback(); }
        });
    },

    restore: function(url){
        chrome.tabs.create({'url': url}, function(tab) {
            console.log('Tab restored: ' + url);
        });
    },

    getSaved: function(){
        return LaterTabs.tabs;
    }
};

(function(){
    LaterTabs.init();
    var tabList = LaterTabs.getSaved();

    createList(tabList);

    var saveButton = document.getElementById('save_current_tab_button');
    var saveAllButton = document.getElementById('save_all_tabs_button');

    saveButton.addEventListener('click', function(){
        LaterTabs.saveCurrent(createList);
    });

    saveAllButton.addEventListener('click', function(){
        LaterTabs.saveAll(createList);
    });

    function createList(){
        var items = LaterTabs.tabs,
            htmlContent = '';
        for (var i in items){
            htmlContent += '<li>' + items[i].url + '</li>';
        }
        document.getElementById('tab_list').innerHTML = htmlContent;
    }
})();
