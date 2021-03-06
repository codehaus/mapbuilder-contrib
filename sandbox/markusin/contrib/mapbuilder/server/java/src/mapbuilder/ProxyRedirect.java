/******************************************************************
Filename: ProxyRedirect.java
Document Type: Java servlet
Purpose: This servlet will write the body content of a request to a file.
 *        The file name is returned as the response.
 *        Set the output directory as servlet init-param in web.xml
 
License: LGPL as per: http://www.gnu.org/copyleft/lesser.html
$Id: ProxyRedirect.java 3650 2007-11-28 00:26:06Z rdewit $
**************************************************************************/
package mapbuilder;

import java.io.*;
import java.util.*;
import javax.servlet.*;
import javax.servlet.http.*;
import org.apache.commons.httpclient.*;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.httpclient.methods.GetMethod;

// import log4j packages
import org.apache.log4j.Logger;
import org.apache.log4j.PropertyConfigurator;


public class ProxyRedirect extends HttpServlet
{

	private final static Logger log =	Logger.getLogger(ProxyRedirect.class);
  
//---------------------------------------------------------------------------
// Public Methods
//----------------------------------------------------------------------------
  public ServletContext context_ = null;

 /***************************************************************************
  * Initialize variables called when context is initialized
  *
  */
  public void init( ServletConfig config ) throws ServletException
  {
    super.init( config );
    context_ = config.getServletContext();
    log.info("mapbuilder.ProxyRedirect: context initialized to:" + context_.getServletContextName());
  }

 /***************************************************************************
  * Process the HTTP Get request
  */
  public void doGet( HttpServletRequest request, HttpServletResponse response )
            throws ServletException
  {
    try {
      if (log.isDebugEnabled()) {
        Enumeration e = request.getHeaderNames();
        while (e.hasMoreElements()) {
          String name = (String)e.nextElement();
          String value = request.getHeader(name);
          log.debug("request header:" + name + ":" + value);
        }
      }
        
      // Transfer bytes from in to out
      log.debug("HTTP GET: transferring...");
      
      //execute the GET
      String serverUrl = request.getParameter("url");
      if (serverUrl.startsWith("http://") || serverUrl.startsWith("https://")) {
        log.info("GET param serverUrl:" + serverUrl);
        HttpClient client = new HttpClient();
        GetMethod httpget = new GetMethod(serverUrl);
        client.executeMethod(httpget);

        if (log.isDebugEnabled()) {
          Header[] respHeaders = httpget.getResponseHeaders();
          for (int i=0; i<respHeaders.length; ++i) {
            String headerName = respHeaders[i].getName();
            String headerValue = respHeaders[i].getValue();
            log.debug("responseHeaders:" + headerName + "=" + headerValue);
          }
        }

        //dump response to out
        if (httpget.getStatusCode() == HttpStatus.SC_OK) {
          //force the response to have XML content type (WMS servers generally don't)
          response.setContentType("text/xml");
          String responseBody = httpget.getResponseBodyAsString().trim();
          response.setContentLength(responseBody.length());
          log.info("responseBody:" + responseBody);
          PrintWriter out = response.getWriter();
          out.print( responseBody );
          response.flushBuffer();
        } else {
          log.error("Unexpected failure: " + httpget.getStatusLine().toString());
        }
        httpget.releaseConnection();
      } else {
        throw new ServletException("only HTTP(S) protocol supported");
      }
      
     
    } catch (Throwable e) {
      throw new ServletException(e);
    }    
  }// doGet
public static String inputStreamAsString(InputStream stream)
throws IOException {
	BufferedReader br = new BufferedReader(new InputStreamReader(stream));
	StringBuilder sb = new StringBuilder();
	String line = null;

	while ((line = br.readLine()) != null) {
	sb.append(line + "\n");
	}

	br.close();
	return sb.toString();
	}
 /***************************************************************************
  * Process the HTTP Post request
  */
  public void doPost( HttpServletRequest request,
                      HttpServletResponse response ) 
                        throws ServletException
  {
    try {
      if (log.isDebugEnabled()) {
        Enumeration e = request.getHeaderNames();
        while (e.hasMoreElements()) {
          String name = (String)e.nextElement();
          String value = request.getHeader(name);
          log.debug("request header:" + name + ":" + value);
        }
      }
        
      String serverUrl = request.getHeader("serverUrl");
      if (serverUrl.startsWith("http://") || serverUrl.startsWith("https://")) {
        PostMethod httppost = new PostMethod(serverUrl);

        // Transfer bytes from in to out
        log.info("HTTP POST transfering..." + serverUrl);
        PrintWriter out = response.getWriter();
        String body = inputStreamAsString( request.getInputStream());

        HttpClient client = new HttpClient();

        httppost.setRequestBody(body);
        if (0 == httppost.getParameters().length){
        	log.debug("No Name/Value pairs found ... pushing as raw_post_data");
            httppost.setParameter("raw_post_data", body);
        }
        if (log.isDebugEnabled()) {
          	log.debug("Body = "+body);
        	NameValuePair[] nameValuePairs = httppost.getParameters();
        	log.debug("NameValuePairs found: "+nameValuePairs.length);
            for (int i=0; i<nameValuePairs.length; ++i) {
                log.debug("parameters:" + nameValuePairs[i].toString());
              }
        }
        //httppost.setRequestContentLength(PostMethod.CONTENT_LENGTH_CHUNKED);

        client.executeMethod(httppost);
        if (log.isDebugEnabled()) {
          Header[] respHeaders = httppost.getResponseHeaders();
          for (int i=0; i<respHeaders.length; ++i) {
            String headerName = respHeaders[i].getName();
            String headerValue = respHeaders[i].getValue();
            log.debug("responseHeaders:" + headerName + "=" + headerValue);
          }
        }

        if (httppost.getStatusCode() == HttpStatus.SC_OK) {
          response.setContentType("text/xml");
          String responseBody = httppost.getResponseBodyAsString();
          response.setContentLength(responseBody.length());
          log.info("responseBody:" + responseBody);
          out.print( responseBody );
        } else {
          log.error("Unexpected failure: " + httppost.getStatusLine().toString());
        }
        httppost.releaseConnection();
      } else {
        throw new ServletException("only HTTP(S) protocol supported");
      }
     
    } catch (Throwable e) {
      throw new ServletException(e);
    }    
  } // doPost

}
