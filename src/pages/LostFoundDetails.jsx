import {
  doc,
  getDoc
} from "firebase/firestore";

import {
  useEffect,
  useState
} from "react";

import {
  Link,
  useParams
} from "react-router-dom";

import { db } from "../firebase/firebase";

export default function LostFoundDetails(){

  const {id}=useParams();

  const [item,setItem]=useState(null);

  useEffect(()=>{

    async function load(){

      const snap=await getDoc(
        doc(db,"lostFound",id)
      );

      if(snap.exists()){

        setItem({
          id:snap.id,
          ...snap.data()
        });

      }

    }

    load();

  },[id]);

  if(!item){

    return <div className="page active">

      <div className="empty-state">

        Loading...

      </div>

    </div>

  }

  return(

    <div className="page active">

      <div className="add-form">

        <Link className="detail-back" to="/lost-found">

          ← Back

        </Link>

        <div className="form-section-title">

          {item.title}

        </div>

        {item.photo && (

          <img

            src={item.photo}

            alt={item.title}

            className="detail-image"

          />

        )}

        <p>

          <strong>Type:</strong>

          {" "}

          {item.type}

        </p>

        <p>

          <strong>Description:</strong>

          <br/>

          {item.description}

        </p>

        <p>

          <strong>Location:</strong>

          <br/>

          {item.district}

          {" "}

          {item.town}

        </p>

        <p>

          <strong>Contact:</strong>

          <br/>

          {item.contactName}

        </p>

        <div className="home-action-row">

          <a

            href={`tel:${item.phone}`}

            className="home-action-btn"

          >

            📞 Call

          </a>

          <a

            href={`https://wa.me/94${item.phone.replace(/^0/,"")}`}

            target="_blank"

            rel="noreferrer"

            className="home-action-btn"

          >

            WhatsApp

          </a>

        </div>

      </div>

    </div>

  );

}