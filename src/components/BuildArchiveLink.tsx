import React from 'react'
import archive from '../../content/build-archive.json'
import { publicPath } from '../public-path'

export function BuildArchiveLink() {
  return <a className="build-archive-link" href={publicPath(archive.reviewPath)}>Review the previous build →</a>
}
