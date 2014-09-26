require "rubygems"
require "bundler/setup"
require "stringex"

posts_dir = "_posts"

desc "Begin a new post in #{posts_dir}"
task :new_post, :title do |t, args|
  if args.title
    title = args.title
  else
    title = get_stdin("Enter a title for your post: ")
  end

  if args.author
    author = args.author
  else
    author = get_stdin("Enter the name of the author: ")
  end

  filename = "#{posts_dir}/#{Time.now.strftime('%Y-%m-%d')}-#{title.to_url}.md"
  if File.exist?(filename)
    abort("rake aborted!") if ask("#{filename} already exists. Do you want to overwrite?", ['y', 'n']) == 'n'
  end
  puts "Creating new post: #{filename}"
  open(filename, 'w') do |post|
    post.puts "---"
    post.puts "layout: post"
    post.puts "title: \"#{title.gsub(/&/,'&amp;')}\""
    post.puts "author: \"#{author}\""
    post.puts "date: #{Time.now.strftime('%Y-%m-%d %H:%M')}"

    post.puts "tags:"
    post.puts "  - example"
    post.puts "  - tags"
    post.puts "  - here"
    post.puts "shared_square_image: http://brewhouse.io/images/posts/2014/Jul/square-400px-img-here.png"
    post.puts "shared_description: Write a sentence or two about the blog post here!"
    post.puts "draft: true"
    post.puts "published: false"

    post.puts "---"
  end
end

def get_stdin(message)
  print message
  STDIN.gets.chomp
end
