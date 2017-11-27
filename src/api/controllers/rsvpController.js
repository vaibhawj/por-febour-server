import axios from 'axios';
import CircularJSON from 'circular-json';

const couchDbUrl = process.env.couchUrl;
const auth = {
    username: process.env.couchUser,
    password: process.env.couchPassword
}

const getRsvp = async (phone) => {
    let oldRsvpPromise = await axios.get(`${couchDbUrl}/${phone}`, {
        headers: {
            ...auth
        }
    })
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            return null;
        });

    let oldRsvp = await Promise.resolve(oldRsvpPromise);
    return oldRsvp;
}

export const submitRsvp = async (req, res) => {
    let rsvp = req.body;
    let oldRsvp = await getRsvp(rsvp.phone);

    if (oldRsvp === null) {
        await axios.post(`${couchDbUrl}`, {
            "name": rsvp.name,
            "phone": rsvp.phone,
            "email": rsvp.email,
            "isComing": rsvp.isComing,
            "msg": rsvp.msg,
            "_id": rsvp.phone,
            "lastSaved": new Date().toString()
        }, {
            headers: {
                ...auth
            }
        }).then((response) => {
            res.status(200).send('Saved successfully!');
        })
            .catch((error) => {
                res.status(500).send(CircularJSON.stringify(error));
            })

    } else {
        await axios.put(`${couchDbUrl}/${rsvp.phone}`, {
            "name": rsvp.name,
            "phone": rsvp.phone,
            "email": rsvp.email,
            "isComing": rsvp.isComing,
            "msg": rsvp.msg,
            "_id": rsvp.phone,
            "_rev": oldRsvp._rev,
            "lastSaved": new Date().toString()
        }, {
            headers: {
                ...auth
            }
        })
            .then((response) => {
                res.status(200).send('Updated Successfully!');
            })
            .catch((error) => {
                res.status(500).send(CircularJSON.stringify(error));
            })
    }
}

