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

    remove: function(url){
        if (LaterTabs.tabs[url]){
            delete LaterTabs.tabs[url];
            LaterTabs.notify('Tab removed', url);
            return true;
        }
        return false;
    },

    saveCurrent: function(callback){
        chrome.tabs.getSelected(null, function(tab){
            LaterTabs.save({ url: tab.url, title: tab.title });
            LaterTabs.notify('Tab saved', tab.url);
            if (callback){ callback(); }
        });
    },

    saveAll: function(callback){
        chrome.tabs.getAllInWindow(null, function(tabs){
            for (var i=0; i < tabs.length; i++){
                LaterTabs.save({ url: tabs[i].url, title: tabs[i].title });
            }
            LaterTabs.notify('All tabs saved', '');
            if (callback){ callback(); }
        });
    },

    restore: function(url){
        chrome.tabs.create({'url': url}, function(tab) {
            LaterTabs.notify('Tab restored', url);
        });
    },

    getSaved: function(){
        return LaterTabs.tabs;
    },

    notify: function(title, text){
        var notification = webkitNotifications.createNotification(
            '/imgs/clock.png',
            title,
            text
        );
        notification.show();
    }
};

(function(){
    LaterTabs.init();
    var tabList = LaterTabs.getSaved();

    createList(tabList);

    var saveButton = document.getElementById('save_current_tab_button');
    var saveAllButton = document.getElementById('save_all_tabs_button');
    var settingsButton = document.getElementById('settings_button');
    var deleteButtons = document.querySelector('.delete_button');

    saveButton.addEventListener('click', function(){
        LaterTabs.saveCurrent(createList);
    });

    saveAllButton.addEventListener('click', function(){
        LaterTabs.saveAll(createList);
    });

    settingsButton.addEventListener('click', function(){
        chrome.tabs.create({ url: "options.html" });
    });

    /*for (var i in deleteButtons){
        deleteButtons[i].addEventListener('click', function(){
            LaterTabs.remove();
        });
    }*/

    function createList(){
        var items = LaterTabs.tabs,
            htmlContent = '';
        for (var i in items){
            htmlContent += '<li>' + items[i].url + ' <a class="delete_button" href="#">';
            htmlContent += 'Delete</a></li>';
        }
        document.getElementById('tab_list').innerHTML = htmlContent;
    }
})();
