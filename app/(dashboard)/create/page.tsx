import { getPosts } from '@/actions/posts.action';
import { getDBUserId } from '@/actions/users.action';
import CreatePost from '@/components/CreatePost';
import { currentUser } from '@clerk/nextjs/server';
import React from 'react'

const CreatePage = async() => {
  const user = await currentUser();
  const posts = await getPosts();
  const dbUserId = await getDBUserId();

  return (
    <div className='grid grid-cols-1 lg:grid-cols-10 gap-6'>
      <div className='lg:col-span-6'>
        {user ? <CreatePost /> : null}


      </div>

    </div>
  )
}

export default CreatePage;