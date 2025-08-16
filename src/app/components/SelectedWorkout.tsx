import React from 'react'
import { useGetWorkout } from '../hooks/workout/useGetWorkout'

const SelectedWorkout = ({workoutId}) => {
  const {workout, isError,isLoading,mutate} = useGetWorkout(workoutId)

  if (isLoading) return <p>loading...</p>;
  if (isError) return <p className="text-red-500">에러 : {String(isError)}</p>;
  
  return (
    <div>{workout.name}</div>
  )
}

export default SelectedWorkout