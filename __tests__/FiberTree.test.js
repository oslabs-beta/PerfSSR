const { Tree } = require('../backend/fiberTree.ts');
const FiberNode = require('../testing files/FiberNode.js');
const rebuiltTree = require('../testing files/RebuiltTree.js');

const treeInstance = new Tree(FiberNode);

test('Tree has buildTree method', () => {    
    expect(treeInstance).toHaveProperty('buildTree');
});

test('Tree.buildTree is a function', () => {
    expect(typeof treeInstance.buildTree).toEqual('function')
});

test('output tree has a root property at the highest level', () => {
    expect(treeInstance).toHaveProperty('root');
});

test('The first layer of the Tree should have one component with the tag name Host Root ', () => {
    expect(treeInstance.root.tagObj.tagName).toEqual('Host Root');
});


test('The third layer of the Tree should have two children', () => {
    expect(treeInstance.root.children[0].children).toHaveLength(2);
});

test('The third layer of the Tree\'s first child component should be without name', () => {
    expect(treeInstance.root.children[0].children[0].componentName).toEqual('');
});

test('The third layer of the Tree\'s second child component should be A CSC', () => {
    expect(treeInstance.root.children[0].children[1].componentName).toEqual('A CSC');
});
