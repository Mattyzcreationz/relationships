const express = require('express');
const slugify = require('slugify');
const ExpressError = require('../expressError');
const db = require('../db');

let router =  new express.Router();
// list GET
router.get('/', async function (req, res, next){
    
    try {
        const results =  await db.query(
            `SELECT code, name
            FROM companies ORDER BY name`
        );
        return res.json({'companies': results.rows});
    }
    catch(err){
        return next(err);
    }
});
// GET method
router.get('/code', async function (req, res, next){
    try{
        let code = req.param.code;
        const compResults = await db.query(
            `SELECT code, name, description FROM companies WHERE code  = $1`,
        [code]
        );
        const invResults = await db.query(
            `SELECT id FROM invoices WHERE comp_code = $1`,
            [code]
        );
        if (compResults.rows.length === 0){
            throw new ExpressError(`No such company: ${code}`, 404);
        }
        const company = compResults.rows[0];
        const invoices = invResults.rows;
        company.invoices  = invoices.map(inv => inv.id);
        return res.json({'company': company});
    }
    catch(err){
        return next(err);
    }
});

// POST 
\router.post('/', async function (req, res, next){
    try{
        let {name,description} = req.body;
        let code = slugify(name, {lower:true});
        const results = await db.query(
            `INSERT INTO companies  (code, name, description) VALUES ($1, $2, $3,) RETURNING code, name, description`, [code, name, description]);
            return res.status(201).json({'company': results.rows[0]});
    }
    catch (err){
        return next(err);
    }
});

// PUT for [code] in order to allow consumer to create updates. to data base list

router.put('/', async function (req, res, next){
    try{
        let {name, description} = req.body;
        let code = req.param.code;
        const result =  await db.query(
            `UPDATE companies SET name=$1, description=$2 WHERE code = $3 RETURNING code, name, description`, [name, description, code]);
            if(result.rows.length === 0){
                throw new ExpressError(`No such company: ${code}`, 404)
            } else {
                return res.json({'company': result.rows[0]});
            }
      }
      catch(err){
        return next(err);
      }
});





// DELETE ofc

router.delete('/:code', async function (req, res, next){
    try{
        let code =  req.params.code;
        const results = await db.query(
            `DELETE  FROM companies WHERE code=$1 RETURNING code`, [code]);
            if(results.rows.lenght === 0){
                throw new ExpressError(`No such company: ${code}`, 404)
            } else {
                return res.json({"status": 'deleted'});
            }
    }
    catch (err){
        return next(err);
    }
})