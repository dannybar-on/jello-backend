const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId

async function query(){
    try {
        const collection = await dbService.getCollection('board');        
        const boards = await collection.find().toArray() || [];
        
        return boards;
    } catch (err) {
        logger.error('Cannot find boards', err)
        throw err
    }
}

async function getById(boardId) {
    try {
        const collection = await dbService.getCollection('board');
        const board = await collection.findOne({'_id': ObjectId(boardId)})
        return board;
    } catch (err) {
        logger.error(`While finding board ${boardId}`, err)
        throw err
    }
}

async function remove(boardId) {
    try { 
        const collection = await dbService.getCollection('board');
        await collection.deleteOne({ '_id': ObjectId(boardId)})
        return boardId;
    } catch (err) {
        logger.error(`Cannot remove board ${boardId}`, err)
        throw err
    }
}

async function add(board) {
    try {
        newBoard = {
            ...board,
        }

        const collection = await dbService.getCollection('board');
        await collection.insertOne(newBoard);
        return newBoard;
    } catch (err) {
        logger.error('Cannot insert board', err)
        throw err
    }
}

async function update(board) {
    try {
        const boardToUpdate = {...board, _id: ObjectId(board._id)}
        const collection = await dbService.getCollection('board');
        await collection.updateOne({'_id': boardToUpdate._id}, {$set: boardToUpdate })
        
        return boardToUpdate;
    } catch (err) {
        logger.error(`Cannot update board ${board._id}`, err)
        throw err
    }
}

module.exports = {
    remove,
    query,
    getById,
    add,
    update,
    // getLabels
}