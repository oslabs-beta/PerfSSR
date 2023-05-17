import Link from 'next/link';

const Course = (props) => {
  return (
    <div key={props.id} className='card'>
        <h2>{props.title}</h2>
        <small>Level: {props.level}</small>
        <p>{props.description}</p>
        <Link href={props.link} target='_blank' className='btn'>
        Go To Course
        </Link>
    </div>
  );
};

export default Course