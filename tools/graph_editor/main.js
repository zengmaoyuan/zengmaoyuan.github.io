let nodes = [];
let edges = [];
let directed = true;

function getNodeMap() {
    const map = new Map();
    nodes.forEach(n => map.set(String(n.id), n));
    return map;
}

function renderEdges() { // by AI
    const $layer = $('#svg-canvas');
    $layer.find('path, text, polygon').remove();

    const nodeMap = getNodeMap();

    edges.forEach(edge => {
        const sNode = nodeMap.get(String(edge.source));
        const tNode = nodeMap.get(String(edge.target));

        if (!sNode || !tNode || !edge.vNode) return;

        let pathD = "";
        let textX = edge.vNode.x;
        let textY = edge.vNode.y;
        let arrowAngle = 0;
        let targetX = tNode.x;
        let targetY = tNode.y;
        const nodeRadius = 20; // 节点圆半径

        if (sNode === tNode) {
            // === 自环边 ===
            const mx = edge.vNode.x;
            const my = edge.vNode.y;
            let currentTheta = Math.atan2(my - sNode.y, mx - sNode.x);
            const R = 45;

            const angleStart = currentTheta - 0.5;
            const angleEnd = currentTheta + 0.5;

            const startX = sNode.x + Math.cos(angleStart) * nodeRadius;
            const startY = sNode.y + Math.sin(angleStart) * nodeRadius;
            const endX = sNode.x + Math.cos(angleEnd) * nodeRadius;
            const endY = sNode.y + Math.sin(angleEnd) * nodeRadius;

            const cp1x = sNode.x + Math.cos(angleStart) * R * 2;
            const cp1y = sNode.y + Math.sin(angleStart) * R * 2;
            const cp2x = sNode.x + Math.cos(angleEnd) * R * 2;
            const cp2y = sNode.y + Math.sin(angleEnd) * R * 2;

            pathD = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;

            textX = sNode.x + Math.cos(currentTheta) * (R + 15);
            textY = sNode.y + Math.sin(currentTheta) * (R + 15);

            arrowAngle = Math.atan2(endY - cp2y, endX - cp2x);
            targetX = endX;
            targetY = endY;
        } else {
            // === 普通边与重边 (二次贝塞尔曲线) ===
            const mx = edge.vNode.x;
            const my = edge.vNode.y;

            // 还原二次贝塞尔控制点 C
            const cx = 2 * mx - (sNode.x + tNode.x) / 2;
            const cy = 2 * my - (sNode.y + tNode.y) / 2;

            // 【修复问题1】：精准计算控制点 C 到目标节点 T 的切线方向
            let dx = tNode.x - cx;
            let dy = tNode.y - cy;
            let dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 0.001) {
                dx = tNode.x - sNode.x;
                dy = tNode.y - sNode.y;
                dist = Math.sqrt(dx * dx + dy * dy) || 1;
            }

            const ux = dx / dist;
            const uy = dy / dist;

            // 终点精确停在目标节点圆周边缘，避免线条穿透圆心导致箭头错位
            targetX = tNode.x - ux * nodeRadius;
            targetY = tNode.y - uy * nodeRadius;
            arrowAngle = Math.atan2(dy, dx);

            // 贝塞尔曲线绘制至 targetX, targetY 为止
            pathD = `M ${sNode.x} ${sNode.y} Q ${cx} ${cy} ${targetX} ${targetY}`;

            textX = mx;
            textY = my - 8;
        }

        const $path = $(document.createElementNS("http://www.w3.org/2000/svg", "path")).attr({
            d: pathD, stroke: '#999', 'stroke-width': 2, fill: 'none'
        });
        $layer.append($path);

        if (directed) {
            const arrowLength = 10;
            const arrowWidth = 5;

            const x1 = targetX - arrowLength * Math.cos(arrowAngle) + arrowWidth * Math.sin(arrowAngle);
            const y1 = targetY - arrowLength * Math.sin(arrowAngle) - arrowWidth * Math.cos(arrowAngle);
            const x2 = targetX - arrowLength * Math.cos(arrowAngle) - arrowWidth * Math.sin(arrowAngle);
            const y2 = targetY - arrowLength * Math.sin(arrowAngle) + arrowWidth * Math.cos(arrowAngle);

            const $arrow = $(document.createElementNS("http://www.w3.org/2000/svg", "polygon")).attr({
                points: `${targetX},${targetY} ${x1},${y1} ${x2},${y2}`,
                fill: '#999'
            });
            $layer.append($arrow);
        }

        if (edge.weight) {
            const $text = $(document.createElementNS("http://www.w3.org/2000/svg", "text")).attr({
                x: textX, y: textY, fill: '#666',
                'font-family': 'Consolas', 'font-weight': 'bold', 'font-size': '12px', 'text-anchor': 'middle'
            }).text(edge.weight);
            $layer.append($text);
        }
    });
}

function renderNodes() {
    const $layer = $('#nodes-layer');
    const currentDomIds = $('.graph-node').map(function () { return $(this).attr('id').replace('node-', ''); }).get();
    currentDomIds.forEach(domId => {
        if (!nodes.some(n => String(n.id) === String(domId))) {
            $(`#node-${domId}`).remove();
        }
    });

    const containerWidth = $('#graph-container').width();
    const containerHeight = $('#graph-container').height();
    const containerOffset = $('#graph-container').offset();

    nodes.forEach(node => {
        let $node = $(`#node-${node.id}`);

        if ($node.length === 0) {
            $node = $('<div></div>')
                .addClass('graph-node')
                .attr('id', `node-${node.id}`)
                .text(node.label)
                .css({ left: node.x, top: node.y });

            $node.on('mousedown', function (e) {
                e.stopPropagation();
                node.dragging = true;

                let startX = e.pageX;
                let startY = e.pageY;
                let mouseLastX = e.pageX;
                let mouseLastY = e.pageY;

                const $this = $(this);
                let isMoved = false;

                $(document).on('mousemove.drag', function (e) {
                    if (Math.hypot(e.pageX - startX, e.pageY - startY) > 1) {
                        isMoved = true;
                    }

                    let dx = e.pageX - mouseLastX;
                    let dy = e.pageY - mouseLastY;

                    node.x += dx;
                    node.y += dy;
                    node.x = Math.min(Math.max(25, node.x), containerWidth - 25);
                    node.y = Math.min(Math.max(25, node.y), containerHeight - 25);

                    mouseLastX = Math.min(Math.max(containerOffset.left + 25, e.pageX), containerOffset.left + containerWidth - 25);
                    mouseLastY = Math.min(Math.max(containerOffset.top + 25, e.pageY), containerOffset.top + containerHeight - 25);


                    $this.css({ left: node.x, top: node.y });

                    renderEdges();
                    startPhysics();
                });

                $(document).on('mouseup.drag', function () {
                    $(document).off('.drag');
                    node.dragging = false;
                    if (!isMoved) {
                        node.fixed = !node.fixed;
                        if (node.fixed) $this.addClass('fixed');
                        else $this.removeClass('fixed');
                    }
                    startPhysics();
                });
            });
            $layer.append($node);
        }

        if (node.fixed) $node.addClass('fixed');
        else $node.removeClass('fixed');
    });
}

function updateEdgeVirtualNodes() {
    const nodeMap = getNodeMap();

    edges.forEach((edge, id) => {
        if (!edge.vNode) {
            const sNode = nodeMap.get(String(edge.source));
            const tNode = nodeMap.get(String(edge.target));
            if (!sNode || !tNode) return;

            let midX = (sNode.x + tNode.x) / 2;
            let midY = (sNode.y + tNode.y) / 2;

            const jitter = (Math.random() - 0.5) * 4;

            edge.vNode = {
                id: `edge-virtual-${id}`,
                x: midX + jitter,
                y: midY + jitter,
                vx: 0, vy: 0
            };
        }
    });
}

let animationFrameId = null;

function updatePhysics() {
    const NodeNodeStrength = 400;
    const EdgeEdgeStrength = 1000;
    const NodeEdgeStrength = 400;
    const EdgeStrength = 0.05;
    const EdgeLength = 120;
    const Friction = 0.65;

    const SelfLoopRadius = 60;
    const VNodeSpringStrength = 0.08;

    const nodeMap = getNodeMap();

    nodes.forEach(node => {
        if (node.vx === undefined) node.vx = 0;
        if (node.vy === undefined) node.vy = 0;
    });

    updateEdgeVirtualNodes();

    edges.forEach(edge => {
        if (edge.vNode) {
            if (edge.vNode.vx === undefined) edge.vNode.vx = 0;
            if (edge.vNode.vy === undefined) edge.vNode.vy = 0;
        }
    });

    // Node to Node
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            let node1 = nodes[i], node2 = nodes[j];
            let dx = node2.x - node1.x;
            let dy = node2.y - node1.y;
            let disSq = dx * dx + dy * dy || 1;
            let dis = Math.sqrt(disSq);

            let f = NodeNodeStrength / disSq;
            let fx = (dx / dis) * f;
            let fy = (dy / dis) * f;
            node1.vx -= fx; node1.vy -= fy;
            node2.vx += fx; node2.vy += fy;
        }
    }

    // Node to Edge (real to virtual)
    nodes.forEach(node => {
        edges.forEach(edge => {
            if (String(edge.target) === String(node.id) || String(edge.source) === String(node.id) || !edge.vNode) return;

            let vNode = edge.vNode;
            let dx = vNode.x - node.x;
            let dy = vNode.y - node.y;
            let disSq = dx * dx + dy * dy || 1;
            let dis = Math.sqrt(disSq);

            if (dis < 180) {
                let f = NodeEdgeStrength / disSq;
                let fx = (dx / dis) * f;
                let fy = (dy / dis) * f;

                vNode.vx += fx;
                vNode.vy += fy;
            }
        });
    });

    // Edge to Edge (virtual nodes)
    for (let i = 0; i < edges.length; i++) {
        for (let j = i + 1; j < edges.length; j++) {
            let e1 = edges[i], e2 = edges[j];
            if (!e1.vNode || !e2.vNode) continue;

            let vNode1 = e1.vNode;
            let vNode2 = e2.vNode;

            let dx = vNode2.x - vNode1.x;
            let dy = vNode2.y - vNode1.y;
            let dis = Math.sqrt(dx * dx + dy * dy);

            if (dis < 0.1) {
                dx = (i % 2 === 0 ? 1 : -1);
                dy = (j % 2 === 0 ? 1 : -1);
                dis = Math.sqrt(dx * dx + dy * dy);
            }

            let effectiveDis = Math.max(dis, 30);
            let f = EdgeEdgeStrength / (effectiveDis * effectiveDis);

            const isParallel = (e1.source === e2.source && e1.target === e2.target) ||
                (e1.source === e2.target && e1.target === e2.source);
            if (isParallel) {
                f *= 1.8;
            }

            let fx = (dx / dis) * f;
            let fy = (dy / dis) * f;

            vNode1.vx -= fx; vNode1.vy -= fy;
            vNode2.vx += fx; vNode2.vy += fy;
        }
    }

    // edge vNode to center
    edges.forEach(edge => {
        let node1 = nodeMap.get(String(edge.source));
        let node2 = nodeMap.get(String(edge.target));
        if (!node1 || !node2 || node1.id === node2.id) return;

        let cx = (node2.x + node1.x) / 2;
        let cy = (node2.y + node1.y) / 2;

        let vNode = edge.vNode;
        let dx = cx - vNode.x;
        let dy = cy - vNode.y;

        vNode.vx += dx * VNodeSpringStrength;
        vNode.vy += dy * VNodeSpringStrength;
    });

    // 5. 节点弹簧拉力
    edges.forEach(edge => {
        let node1 = nodeMap.get(String(edge.source));
        let node2 = nodeMap.get(String(edge.target));
        if (!node1 || !node2 || node1.id === node2.id) return;

        let dx = node2.x - node1.x;
        let dy = node2.y - node1.y;
        let dis = Math.sqrt(dx * dx + dy * dy) || 1;

        let f = (dis - EdgeLength) * EdgeStrength;
        let fx = (dx / dis) * f;
        let fy = (dy / dis) * f;

        node1.vx += fx; node1.vy += fy;
        node2.vx -= fx; node2.vy -= fy;
    });

    // 位置更新与几何绑定
    const containerWidth = $('#graph-container').width();
    const containerHeight = $('#graph-container').height();
    let totalEnergy = 0;

    nodes.forEach(node => {
        if (node.fixed || node.dragging) {
            node.vx = node.vy = 0;
            return;
        }

        node.vx *= Friction;
        node.vy *= Friction;

        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 30) { node.x = 30; node.vx *= -0.5; }
        if (node.x > containerWidth - 30) { node.x = containerWidth - 30; node.vx *= -0.5; }
        if (node.y < 30) { node.y = 30; node.vy *= -0.5; }
        if (node.y > containerHeight - 30) { node.y = containerHeight - 30; node.vy *= -0.5; }

        totalEnergy += node.vx * node.vx + node.vy * node.vy;
    });

    edges.forEach(edge => {
        if (!edge.vNode) return;

        let vNode = edge.vNode;
        vNode.vx *= Friction;
        vNode.vy *= Friction;
        vNode.x += vNode.vx;
        vNode.y += vNode.vy;

        const sNode = nodeMap.get(String(edge.source));
        const tNode = nodeMap.get(String(edge.target));
        if (!sNode || !tNode) return;

        if (sNode.id === tNode.id) {
            // 自环约束：固定在以节点为中心、SelfLoopRadius 为半径的圆周上
            let dx = vNode.x - sNode.x;
            let dy = vNode.y - sNode.y;
            let dis = Math.sqrt(dx * dx + dy * dy);
            if (dis === 0) {
                dx = 1; dy = -1; dis = Math.SQRT2;
            }
            vNode.x = sNode.x + (dx / dis) * SelfLoopRadius;
            vNode.y = sNode.y + (dy / dis) * SelfLoopRadius;
        } else {
            // 普通边：约束到中垂线上
            let mx = (sNode.x + tNode.x) / 2;
            let my = (sNode.y + tNode.y) / 2;

            let dx = tNode.x - sNode.x;
            let dy = tNode.y - sNode.y;
            let len = Math.sqrt(dx * dx + dy * dy) || 1;

            let nx = -dy / len;
            let ny = dx / len;
            let vx = vNode.x - mx;
            let vy = vNode.y - my;

            let projLen = vx * nx + vy * ny;
            vNode.x = mx + nx * projLen;
            vNode.y = my + ny * projLen;
        }

        totalEnergy += vNode.vx * vNode.vx + vNode.vy * vNode.vy;
    });

    nodes.forEach(node => {
        $(`#node-${node.id}`).css({ left: node.x, top: node.y });
    });

    renderEdges();

    if (totalEnergy > 0.001) {
        animationFrameId = requestAnimationFrame(updatePhysics);
    } else {
        animationFrameId = null;
        nodes.forEach(node => { node.vx = node.vy = 0; });
        edges.forEach(edge => { if (edge.vNode) edge.vNode.vx = edge.vNode.vy = 0; });
    }
}

function startPhysics() {
    if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(updatePhysics);
    }
}

function onInputChange() {
    const text = $('#graph-input').val().trim();
    const lines = text.split('\n');
    let newEdges = [];
    let newNodes = [];

    let changeNodes = new Set();
    lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length === 0 || parts[0] === "") return;

        let u = parts[0] || "";
        let v = parts[1] || "";
        let w = parts.slice(2).join(" ");

        if (v !== "") {
            changeNodes.add(u);
            changeNodes.add(v);
            newEdges.push({ source: u, target: v, weight: w });
        } else if (u !== "") {
            changeNodes.add(u);
        }
    });

    const containerWidth = $('#graph-container').width();
    const containerHeight = $('#graph-container').height();

    changeNodes.forEach(nodeId => {
        const existingNode = nodes.find(n => String(n.id) === String(nodeId));
        if (existingNode) {
            newNodes.push(existingNode);
        } else {
            newNodes.push({
                id: nodeId,
                label: nodeId,
                x: containerWidth / 2 + (Math.random() - 0.5) * 20,
                y: containerHeight / 2 + (Math.random() - 0.5) * 20,
                fixed: false
            });
        }
    });

    let oldEdgesPool = [...edges];

    newEdges.forEach(newEdge => {
        const index = oldEdgesPool.findIndex(oldEdge =>
            String(oldEdge.source) === String(newEdge.source) &&
            String(oldEdge.target) === String(newEdge.target) &&
            oldEdge.vNode
        );

        if (index !== -1) {
            newEdge.vNode = oldEdgesPool[index].vNode;
            oldEdgesPool.splice(index, 1);
        }
    });

    edges = newEdges;
    nodes = newNodes;
    renderNodes();
    renderEdges();
    startPhysics();
}

function arrangeAsTree() { // position by AI
    let mp = getNodeMap();
    let fa = {};
    let childrenMap = {}; // 记录父 -> 子关系
    let dep = {};

    nodes.forEach(node => {
        node.fixed = true;
        node.vx = node.vy = 0;
        dep[node.id] = 0;
        fa[node.id] = [];
        childrenMap[node.id] = [];
    });

    /* ====== 1. 字典序最小节点作为根 + BFS 确定层级与严格父子关系 ====== */
    let sortedNodes = [...nodes].sort((a, b) =>
        String(a.id).localeCompare(String(b.id), undefined, { numeric: true })
    );

    sortedNodes.forEach(rootNode => {
        if (dep[rootNode.id] !== 0) return;

        let queue = [], front = 0;
        queue.push(rootNode.id);
        dep[rootNode.id] = 1;

        while (front < queue.length) {
            let u = queue[front++];
            edges.forEach(edge => {
                let v = null;
                if (edge.source == u) {
                    v = edge.target;
                } else if (edge.target == u && !directed) {
                    v = edge.source;
                }

                if (v && v != u) {
                    if (dep[v] === 0) {
                        dep[v] = dep[u] + 1;
                        queue.push(v);
                        fa[v].push(u);
                        childrenMap[u].push(v);
                    } else if (dep[v] === dep[u] + 1) {
                        fa[v].push(u);
                        childrenMap[u].push(v);
                    }
                }
            });
        }
    });

    const containerWidth = $('#graph-container').width();
    const containerHeight = $('#graph-container').height();

    /* ====== 2. 按深度 (层级) 分组 ====== */
    let levels = {};
    nodes.forEach(node => {
        let d = dep[node.id] || 1;
        if (!levels[d]) levels[d] = [];
        levels[d].push(node);
    });

    let maxLevel = Math.max(...Object.keys(levels).map(Number));
    let startY = 60;
    let levelHeight = Math.min(90, (containerHeight - 120) / (maxLevel || 1));
    const minGap = 70; // 节点水平最小间距

    /* ====== 3. 第一阶段：自顶向下（Top-Down）按重心排序与平铺 ====== */
    for (let lvl = 1; lvl <= maxLevel; lvl++) {
        let currentLevel = levels[lvl];
        if (!currentLevel || currentLevel.length === 0) continue;

        if (lvl === 1) {
            // 顶层按字典序排列
            currentLevel.sort((a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true }));
            let startX = (containerWidth - (currentLevel.length - 1) * minGap) / 2;
            currentLevel.forEach((n, i) => n.x = startX + i * minGap);
        } else {
            // 计算父节点重心
            currentLevel.forEach(node => {
                let parents = fa[node.id] || [];
                if (parents.length > 0) {
                    let sumX = 0;
                    parents.forEach(pId => {
                        let pNode = mp.get(String(pId));
                        if (pNode) sumX += pNode.x;
                    });
                    node.barycenter = sumX / parents.length;
                } else {
                    node.barycenter = containerWidth / 2;
                }
            });

            // 依据父节点重心排序
            currentLevel.sort((a, b) => {
                if (Math.abs(a.barycenter - b.barycenter) > 0.001) {
                    return a.barycenter - b.barycenter;
                }
                return String(a.id).localeCompare(String(b.id), undefined, { numeric: true });
            });

            // 防止节点重叠
            let actualX = currentLevel.map(n => n.barycenter);
            for (let i = 1; i < actualX.length; i++) {
                if (actualX[i] < actualX[i - 1] + minGap) {
                    actualX[i] = actualX[i - 1] + minGap;
                }
            }

            // 居中偏移微调
            let desiredCenter = currentLevel.reduce((s, n) => s + n.barycenter, 0) / currentLevel.length;
            let actualCenter = (actualX[0] + actualX[actualX.length - 1]) / 2;
            let shift = desiredCenter - actualCenter;

            currentLevel.forEach((n, i) => n.x = actualX[i] + shift);
        }
    }

    /* ====== 4. 第二阶段：自底向上（Bottom-Up）父节点严格居中于子节点正上方 ====== */
    for (let lvl = maxLevel - 1; lvl >= 1; lvl--) {
        let currentLevel = levels[lvl];
        if (!currentLevel) continue;

        currentLevel.forEach(node => {
            let children = childrenMap[node.id] || [];
            if (children.length > 0) {
                // 父节点 X 坐标强制设为所有子节点 X 坐标的平均值
                let sumX = 0;
                children.forEach(cId => {
                    let childNode = mp.get(String(cId));
                    if (childNode) sumX += childNode.x;
                });
                node.x = sumX / children.length;
            }
        });

        // 重新检查当前层，防止父节点居中后与同层邻居重叠
        currentLevel.sort((a, b) => a.x - b.x);
        for (let i = 1; i < currentLevel.length; i++) {
            if (currentLevel[i].x < currentLevel[i - 1].x + minGap) {
                currentLevel[i].x = currentLevel[i - 1].x + minGap;
            }
        }
    }

    /* ====== 5. 第三阶段：整棵树全局居中与 Y 坐标统一赋值 ====== */
    let allX = nodes.map(n => n.x);
    let minX = Math.min(...allX);
    let maxX = Math.max(...allX);
    let treeCenter = (minX + maxX) / 2;
    let globalOffset = (containerWidth / 2) - treeCenter;

    nodes.forEach(node => {
        node.x += globalOffset;
        let d = dep[node.id] || 1;
        node.y = startY + (d - 1) * levelHeight;
        node.vx = node.vy = 0;
    });

    /* ====== 6. 强制拉直边 & 停止物理引擎干扰 ====== */
    edges.forEach(edge => {
        const sNode = mp.get(String(edge.source));
        const tNode = mp.get(String(edge.target));
        if (sNode && tNode && edge.vNode) {
            edge.vNode.x = (sNode.x + tNode.x) / 2;
            edge.vNode.y = (sNode.y + tNode.y) / 2;
            edge.vNode.vx = 0;
            edge.vNode.vy = 0;
        }
    });

    // 关键：停止物理引擎循环，防止虚点推弯线条或导致位置漂移
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    /* ====== 7. 渲染 ====== */
    renderNodes();
    renderEdges();
    startPhysics();
}

$('#graph-input').on('input', function () { onInputChange(); });

$('#undr-selector').on('click', function () {
    $("#dr-selector").removeClass('active');
    $("#undr-selector").addClass('active');
    directed = false;
    renderEdges();
});

$('#dr-selector').on('click', function () {
    $("#undr-selector").removeClass('active');
    $("#dr-selector").addClass('active');
    directed = true;
    renderEdges();
});

$('#fix-button').on('click', function () {
    nodes.forEach(node => { node.fixed = true; });
    $('.graph-node').addClass('fixed');
});

$('#unfix-button').on('click', function () {
    nodes.forEach(node => { node.fixed = false; });
    $('.graph-node').removeClass('fixed');
    startPhysics();
});

$('#tree-button').on('click', function () {
    arrangeAsTree();
}); a