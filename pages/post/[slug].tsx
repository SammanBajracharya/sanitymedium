import { GetStaticProps } from 'next';
import Header from '../../components/Header';
import { sanityClient, urlFor } from '../../sanity';
import { Post } from '../../typings';
import PortableText from 'react-portable-text';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useState } from 'react';

interface IFormInput {
  _id: string;
  name: string;
  email: string;
  comment: string;
}

interface Props {
  post: Post;
}

const Post = ({ post }: Props) => {
  console.log(post);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>();

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    await fetch('/api/createComment', {
      method: 'POST',
      body: JSON.stringify(data),
    })
      .then((data) => {
        setSubmitted(true);
      })
      .catch((err) => {
        setSubmitted(false);
        console.log(err);
      });
  };

  return (
    <div>
      <Header />

      <img
        className="w-full h-40 object-cover"
        src={urlFor(post.mainImage).url()!}
        alt=""
      />

      <article className="max-w-3xl mx-auto p-5">
        <h1 className="text-3xl mt-10 mb-3">{post.title}</h1>
        <h2 className="text-xl font-light text-gray-500 mb-2">
          {post.description}
        </h2>
        <div className="felx items-center space-x-2">
          <img
            className="w-10 h-10 rounded-full object-cover"
            src={urlFor(post.author.image).url()!}
            alt=""
          />
          <p className="font-extralight text-sm">
            Blog post by{' '}
            <span className="text-green-600">{post.author.name}</span> published
            <span className="text-green-600">
              {new Date(post._createdAt).toLocaleString()}
            </span>
          </p>
        </div>

        <div className="mt-10">
          <PortableText
            className=""
            dataset={process.env.NEXT_PUBLIC_SANITY_DATASET!}
            projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!}
            content={post.body}
            serializers={{
              h1: (props: any) => (
                <h1 className="text-2cl font-bold my-5" {...props} />
              ),
              h2: (props: any) => (
                <h2 className="text-xl font-bold my-5" {...props} />
              ),
              li: ({ children }: any) => (
                <li className="ml-4 list-disc">{children}</li>
              ),
              link: ({ href, children }: any) => (
                <a href={href} className="text-blue-500 hover:underline">
                  {children}
                </a>
              ),
              figure: ({ src, alt }: any) => (
                <img src={src} alt={alt} className="my-5" />
              ),
            }}
          />
        </div>
        <hr className="max-w-lg my-5 mx-auto border border-yellow-500" />

        {submitted ? (
          <div className="shadow flex flex-col p-10 my-10 bg-yellow-500 text-white max-w-2xl mx-auto">
            <h3 className="bold text-3xl">Thank you for submitting</h3>
            <p>Once it's been approved it will show up</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col p-5 max-w-2xl mb-10"
          >
            <h3 className="text-sm text-yellow-500">Enjoyed this article?</h3>
            <h4 className="text-3xl font-bold">Leave a comment below!</h4>
            <hr className="py-3 mt-2" />

            <input
              {...register('_id')}
              type="hidden"
              name="_id"
              value={post._id}
            />

            <label className="block mb-5">
              <span className="text-gray-700">Name</span>
              <input
                {...register('name', { required: true })}
                className="shadow border rounded py-2 px-3 form-input mt-1 block w-full ring-yellow-500 outline-none focus:ring"
                type="text"
                placeholder="John Graham"
              />
            </label>
            <label className="block mb-5">
              <span className="text-gray-700">Email</span>
              <input
                {...register('email', { required: true })}
                className="shadow border rounded py-2 px-3 form-input mt-1 block w-full ring-yellow-500 outline-none focus:ring"
                type="email"
                placeholder="johngraham@domail.com"
              />
            </label>
            <label className="block mb-5">
              <span className="text-gray-700">Comment</span>
              <textarea
                {...register('comment', { required: true })}
                className="shadow border rounded py-2 px-3 form-textarea mt-1 block w-full ring-yellow-500 outline-none focus:ring"
                placeholder="Message"
                rows={8}
              />
            </label>

            {/* Errors */}
            <div className="flex flex-col p-5">
              {errors.name && (
                <span className="text-red-500">
                  - The Name Field is required
                </span>
              )}
              {errors.email && (
                <span className="text-red-500">
                  - The Email Field is required
                </span>
              )}
              {errors.comment && (
                <span className="text-red-500">
                  - The Comment Field is required
                </span>
              )}
            </div>

            <input
              type="submit"
              className="shadow bg-yellow-500 hover:bg-yellow-400 focus:shadow-outline focus:outline-none text-white rounded cursor-pointer px-4 py-2"
            />
          </form>
        )}
        {/* Comments */}
        <div className="border shadow shadow-yellow-200 flex flex-col p-10 my-10 max-w-2xl mx-auto">
          <h3 className="text-4xl">Comments</h3>
          <hr className="pb-2" />

          {post.comments.map((comment) => (
            <div key={comment._id}>
              <p>
                <span className="text-yellow-500">{comment.name}:</span>{' '}
                <span>{comment.comment}</span>
              </p>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
};

export default Post;

// This is to find the path of the current post page
export const getStaticPaths = async () => {
  // giving it query of id and slug
  const query = `*[_type == "post"] {
    _id,
    slug {
      current
    },
  }`;

  // fetching the data of id and slug from sanity CMS
  const posts = await sanityClient.fetch(query);

  // now finding the path of current post page
  const paths = posts.map((post: Post) => ({
    params: {
      slug: post.slug.current,
    },
  }));

  return {
    paths,
    fallback: 'blocking',
  };
};

// This is to get the props/post of the current post page
export const getStaticProps: GetStaticProps = async ({ params }) => {
  // This gets us all the data, inculding other post page data
  const query = `*[_type == "post" && slug.current == $slug][0] {
    _id,
    _createdAd,
    title,
    slug,
    description,
    mainImage,
    author -> {
      name,
      image,
    },
    body,
    'comments': *[
      _type == 'comment' &&
      post._ref == ^._id &&
      approved == true
    ],
  }`;

  // making sure to get only the data of the current post page
  const post = await sanityClient.fetch(query, {
    slug: params?.slug,
  });

  // if post data doesn't exist then send to 404 page
  if (!post) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      post,
    },
    // incremental static regeneration
    revalidate: 60, // after 60 seconds, itll update the old cached version
  };
};
