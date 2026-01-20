import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Server Solutions',
    img: '/img/i3X_Server.png',
    link: '/docs/Server-Solutions/overview',
    description: (
      <>
        Access the resources that connects you to custom APIs and technical documentation,
        giving developers everything needed to integrate, configure, and build powerful server-side solutions with confidence.
      </>
    ),
  },
  {
    title: 'Client Solutions',
    img: '/img/i3X_Client.png',
    link: '/docs/Client-Solutions/overview',
    description: (
      <>
        Build responsive, user-facing experiences with ease. Connect with our client-side APIs and documentation,
        enabling seamless integration, smooth interactions, and efficient data exchange directly within your applications.
      </>
    ),
  },

];

function Feature({img, title, description, link}) {
  return (
    <div className={clsx('col col-4')}>
      <div className="text--center">
        {link ? (
          <a href={link}>
            <img src={img} className={styles.featureSvg} alt={title} />
          </a>
        ) : (
          <img src={img} className={styles.featureSvg} alt={title} />
        )}
      </div>
      <div className="text--center padding-horiz--md">
        {link ? (
          <a href={link} style={{textDecoration: 'none', color: 'inherit'}}>
            <Heading as="h3">{title}</Heading>
          </a>
        ) : (
          <Heading as="h3">{title}</Heading>
        )}
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
