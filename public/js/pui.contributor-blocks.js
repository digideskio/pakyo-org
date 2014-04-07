// Component that manages the contributor list as a whole
pui.component('contributor-blocks', function(doc) {
  var that = this;
  var data;
  var active_contributor;

  this.init = function() {
    if (!that.config.blockSize) that.config.blockSize = 150; // default size

    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
      if (req.readyState == 4 && req.status == 200) { //SUCCESS
        that.announce('contributors:received');
        data = JSON.parse(req.response);
        that.buildContributorBlocks();
        that.announce('contributors:presented');
      } else if (req.readyState == 4 && req.status != 200) { //FAIL
        data = [];
        doc.innerHTML = 'Unable to retrieve contributors for ' + that.config.owner + '/' + that.config.repo + '.'
        that.announce('contributors:unavailable');
      }
    };
    req.open("GET", 'https://api.github.com/repos/' + that.config.owner + '/' + that.config.repo + '/contributors', false);
    req.send();
  }

  this.buildContributorBlocks = function() {
    for(var i = 0, contributor; contributor = data[i]; i++) {
      var block = document.createElement('div')
      block.className = 'contributor';
      block.style.backgroundImage = "url('" + contributor.avatar_url + "')";
      block.setAttribute('data-ui', 'contributor-block');
      block.style.width = that.config.blockSize + 'px';
      block.style.height = that.config.blockSize + 'px';
      block.style.backgroundSize = that.config.blockSize + 'px';

      var cover = document.createElement('div');
      cover.className = 'cover';
      if (!!that.config.tintColor) cover.style.background = that.config.tintColor;
      block.appendChild(cover);

      var info = document.createElement('div');
      info.style.fontSize = (that.config.blockSize / 7.5) + 'px';
      info.style.lineHeight = (that.config.blockSize / 7.5) + 'px';
      if (!!that.config.bgColor) info.style.background = that.config.bgColor;
      if (!!that.config.txtColor) info.style.color = that.config.txtColor;
      info.className = 'info-wrapper';

      var username = document.createElement('a');
      username.className = 'username';
      username.href = contributor.html_url;
      username.target = '_blank';
      username.innerHTML = contributor.login;
      username.style.marginTop = (that.config.blockSize / 5) + 'px';
      if (!!that.config.txtColor) username.style.color = that.config.txtColor;
      info.appendChild(username);

      var count = document.createElement('div');
      count.className = 'count';
      count.innerHTML = contributor.contributions;
      count.style.fontSize = (that.config.blockSize / 5) + 'px';
      count.style.lineHeight = (that.config.blockSize / 5) + 'px';
      info.appendChild(count);

      var text = document.createElement('div');
      text.class = 'text';
      text.innerHTML = (contributor.contributions > 1) ? 'contributions' : 'contribution';
      info.appendChild(text);

      block.appendChild(info);
      doc.appendChild(block);

      block.onclick = that.handleClick;
    }

    pui.componentize('contributor-block');
  }

  this.trackActiveContributor = function(contributor) {
    if (!!active_contributor) active_contributor.deactivate();
    active_contributor = contributor;
  }

  this.forgetActiveContributor = function() {
    active_contributor = null;
  }

  this.findActiveContributor = function() {
    return active_contributor;
  }

  this.react('contributor:activated', that.trackActiveContributor);
  this.react('contributor:deactivated', that.forgetActiveContributor);
  this.react('contributors:findActive', that.findActiveContributor);
});


// Component that manages each individual contributor in the list
pui.component('contributor-block', function(doc) {
  var that = this;

  this.init = function() {
    doc.onclick = that.handleClick;
  }

  this.handleClick = function(e) {
    if (doc.offsetLeft + (doc.offsetWidth * 2) > doc.parentNode.offsetLeft + doc.parentNode.offsetWidth) {
      doc.querySelector('.info-wrapper').className += ' leftside';
    } else {
      doc.querySelector('.info-wrapper').className += ' rightside';
    }

    if (e.target.className.search(/username/) >= 0) {
      e.stopPropagation();
    } else if (doc.className.search(/active/) >= 0) {
      that.deactivate();
    } else {
      that.activate();
    }
  }

  this.activate = function() {
    doc.className += ' active';
    that.announce('contributor:activated', that);
  }

  this.deactivate = function() {
    doc.className = doc.className.replace(/\s?active/, '');
    that.announce('contributor:deactivated');
  }
});