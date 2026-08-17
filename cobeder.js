// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      114514
// @description  try to take over the cobeder!
// @author       You
// @match        https://www.becoder.com.cn/*
// @match        http://222.180.160.110:61235/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
);

let currentNode = walker.nextNode();

// 2. 循环遍历所有文本节点并替换内容
while (currentNode) {
    // 过滤掉 <script> 和 <style> 标签内的文本，防止破坏脚本和样式
    const parentNodeName = currentNode.parentNode.nodeName;
    if (parentNodeName !== 'SCRIPT' && parentNodeName !== 'STYLE') {
        // 使用正则全局替换 (g)
        currentNode.nodeValue = currentNode.nodeValue.replace(/Becoder/g, 'coBeder');
    }
    currentNode = walker.nextNode();
}
})();
